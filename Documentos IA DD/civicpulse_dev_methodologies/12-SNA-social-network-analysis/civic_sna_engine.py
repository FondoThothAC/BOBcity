#!/usr/bin/env python3
# civic_sna_engine.py - Motor de Social Network Analysis para CivicPulse

import networkx as nx
import numpy as np
import pandas as pd
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set, Optional
import community as community_louvain
from datetime import datetime, timedelta
import json

class CivicSNAEngine:
    def __init__(self, graph: nx.Graph = None):
        self.G = graph if graph else nx.Graph()
        self.partitions = {}
        self.metrics_cache = {}

    def build_graph_from_interactions(self, interactions_df: pd.DataFrame) -> nx.DiGraph:
        G = nx.DiGraph()
        for _, row in interactions_df.iterrows():
            source, target = row['source'], row['target']
            if source not in G:
                G.add_node(source, **row.get('source_attrs', {}))
            if target not in G:
                G.add_node(target, **row.get('target_attrs', {}))
            if G.has_edge(source, target):
                G[source][target]['weight'] += row.get('weight', 1)
                G[source][target]['interactions'] += 1
            else:
                G.add_edge(source, target,
                          weight=row.get('weight', 1),
                          interactions=1,
                          first_interaction=row['timestamp'],
                          topics=set([row.get('topic', 'general')]))
        self.G = G
        print(f"Grafo construido: {G.number_of_nodes()} nodos, {G.number_of_edges()} aristas")
        return G

    def calculate_civic_profile(self, node) -> Dict:
        if node not in self.G:
            return None
        local_clustering = nx.clustering(self.G, node)
        community_centrality = self._community_centrality(node)
        topics = self._extract_topics(node)
        topic_diversity = len(topics) / max(len(self.G.nodes[node].get('all_topics', [])), 1)
        homophily = self._calculate_homophily(node)
        influence = self._calculate_influence_score(node)
        connection_diversity = self._connection_diversity(node)

        return {
            'node_id': node,
            'civic_scores': {
                'comunidad': (local_clustering + community_centrality) / 2,
                'interes': topic_diversity,
                'valores': homophily,
                'influencia': influence,
                'conexion': connection_diversity
            },
            'raw_metrics': {
                'clustering_coefficient': local_clustering,
                'community_centrality': community_centrality,
                'dominant_topics': topics,
                'homophily_index': homophily,
                'influence_score': influence,
                'connection_diversity': connection_diversity
            }
        }

    def _community_centrality(self, node) -> float:
        if not self.partitions:
            self.detect_communities()
        partition = self.partitions.get('louvain', {})
        node_community = partition.get(node)
        if node_community is None:
            return 0.0
        community_nodes = [n for n, c in partition.items() if c == node_community]
        subgraph = self.G.subgraph(community_nodes)
        if subgraph.number_of_nodes() < 2:
            return 1.0
        degree_in_community = subgraph.degree(node)
        max_possible = subgraph.number_of_nodes() - 1
        return degree_in_community / max_possible if max_possible > 0 else 0.0

    def _extract_topics(self, node) -> List[str]:
        node_data = self.G.nodes[node]
        outgoing_topics = []
        for _, target, data in self.G.out_edges(node, data=True):
            if 'topics' in data:
                outgoing_topics.extend(list(data['topics']))
        topic_counts = Counter(outgoing_topics)
        total = sum(topic_counts.values())
        if total == 0:
            return []
        return [(topic, count/total) for topic, count in topic_counts.most_common(3)]

    def _calculate_homophily(self, node) -> float:
        neighbors = list(self.G.neighbors(node))
        if not neighbors:
            return 0.0
        node_attrs = self.G.nodes[node]
        similar_count = 0
        for neighbor in neighbors:
            neighbor_attrs = self.G.nodes[neighbor]
            similarity = 0
            checks = 0
            for attr in ['political_leaning', 'age_group', 'location_type']:
                if attr in node_attrs and attr in neighbor_attrs:
                    if node_attrs[attr] == neighbor_attrs[attr]:
                        similarity += 1
                    checks += 1
            if checks > 0 and similarity / checks > 0.5:
                similar_count += 1
        return similar_count / len(neighbors)

    def _calculate_influence_score(self, node) -> float:
        try:
            pagerank = nx.pagerank(self.G).get(node, 0)
        except:
            pagerank = 0
        try:
            betweenness = nx.betweenness_centrality(self.G).get(node, 0)
        except:
            betweenness = 0
        try:
            if self.G.is_directed():
                eigenvector = nx.eigenvector_centrality_numpy(self.G).get(node, 0)
            else:
                eigenvector = nx.eigenvector_centrality(self.G, max_iter=1000).get(node, 0)
        except:
            eigenvector = 0
        return (
            pagerank * 0.35 +
            betweenness * 0.25 +
            eigenvector * 0.25 +
            (self.G.degree(node) / max(dict(self.G.degree()).values(), 1)) * 0.15
        )

    def _connection_diversity(self, node) -> float:
        if not self.partitions:
            self.detect_communities()
        partition = self.partitions.get('louvain', {})
        neighbors = list(self.G.neighbors(node))
        if not neighbors:
            return 0.0
        communities_reached = set(partition.get(n) for n in neighbors)
        total_communities = len(set(partition.values()))
        return len(communities_reached) / total_communities if total_communities > 0 else 0.0

    def detect_communities(self, method='louvain', resolution=1.0) -> Dict:
        if method == 'louvain':
            G_undirected = self.G.to_undirected() if self.G.is_directed() else self.G
            partition = community_louvain.best_partition(G_undirected, resolution=resolution)
        else:
            raise ValueError(f"Metodo {method} no soportado")
        self.partitions[method] = partition
        G_undirected = self.G.to_undirected() if self.G.is_directed() else self.G
        modularity = community_louvain.modularity(partition, G_undirected)
        print(f"Comunidades detectadas: {len(set(partition.values()))}")
        print(f"Modularidad (Q): {modularity:.4f}")
        return partition

    def analyze_community_profiles(self) -> Dict[int, Dict]:
        if not self.partitions:
            self.detect_communities()
        partition = self.partitions['louvain']
        communities = defaultdict(list)
        for node, comm_id in partition.items():
            communities[comm_id].append(node)
        profiles = {}
        for comm_id, members in communities.items():
            civic_scores = [self.calculate_civic_profile(m) for m in members]
            civic_scores = [c for c in civic_scores if c is not None]
            if not civic_scores:
                continue
            avg_scores = {
                'comunidad': np.mean([c['civic_scores']['comunidad'] for c in civic_scores]),
                'interes': np.mean([c['civic_scores']['interes'] for c in civic_scores]),
                'valores': np.mean([c['civic_scores']['valores'] for c in civic_scores]),
                'influencia': np.mean([c['civic_scores']['influencia'] for c in civic_scores]),
                'conexion': np.mean([c['civic_scores']['conexion'] for c in civic_scores])
            }
            all_topics = []
            for c in civic_scores:
                all_topics.extend([t[0] for t in c['raw_metrics']['dominant_topics']])
            top_topics = Counter(all_topics).most_common(5)
            profiles[comm_id] = {
                'size': len(members),
                'civic_profile': avg_scores,
                'dominant_topics': top_topics,
                'avg_influence': avg_scores['influencia'],
                'mobilization_potential': self._community_mobilization(members),
                'geographic_spread': self._community_geo_spread(members)
            }
        return profiles

    def _community_mobilization(self, members: List) -> float:
        scores = []
        for m in members:
            profile = self.calculate_civic_profile(m)
            if profile:
                scores.append(
                    profile['civic_scores']['influencia'] * 0.4 +
                    profile['civic_scores']['comunidad'] * 0.6
                )
        return np.mean(scores) if scores else 0.0

    def _community_geo_spread(self, members: List) -> float:
        locations = []
        for m in members:
            loc = self.G.nodes[m].get('location')
            if loc:
                locations.append(loc)
        if len(locations) < 2:
            return 0.0
        distances = []
        for i in range(len(locations)):
            for j in range(i+1, len(locations)):
                dist = np.sqrt((locations[i][0]-locations[j][0])**2 + 
                              (locations[i][1]-locations[j][1])**2)
                distances.append(dist)
        return np.mean(distances) if distances else 0.0

    def identify_swing_bridges(self, top_n: int = 20) -> List[Dict]:
        if not self.partitions:
            self.detect_communities()
        partition = self.partitions['louvain']
        bridges = []
        for node in self.G.nodes():
            neighbors = list(self.G.neighbors(node))
            if not neighbors:
                continue
            neighbor_communities = set(partition.get(n) for n in neighbors)
            own_community = partition.get(node)
            external_communities = neighbor_communities - {own_community}
            if len(external_communities) >= 2:
                betweenness = nx.betweenness_centrality(self.G).get(node, 0)
                bridges.append({
                    'node_id': node,
                    'own_community': own_community,
                    'communities_connected': len(external_communities),
                    'external_community_ids': list(external_communities),
                    'betweenness_centrality': betweenness,
                    'bridge_strength': len(external_communities) / len(neighbors),
                    'civic_profile': self.calculate_civic_profile(node)
                })
        return sorted(bridges, key=lambda x: x['betweenness_centrality'], reverse=True)[:top_n]

    def detect_bot_networks(self, threshold: float = 0.7) -> List[Dict]:
        suspicious_nodes = []
        for node in self.G.nodes():
            node_data = self.G.nodes[node]
            score = 0.0
            if node_data.get('interactions_per_day', 0) > 50:
                score += 0.2
            topics = node_data.get('topics', [])
            if len(set(topics)) < 3 and len(topics) > 20:
                score += 0.2
            if self.G.is_directed():
                out_neighbors = set(self.G.successors(node))
                in_neighbors = set(self.G.predecessors(node))
                if out_neighbors == in_neighbors and len(out_neighbors) < 10:
                    score += 0.2
            interaction_times = node_data.get('interaction_times', [])
            if len(interaction_times) > 10:
                time_diffs = np.diff(sorted(interaction_times))
                if np.std(time_diffs) < 60:
                    score += 0.2
            if not node_data.get('bio') and not node_data.get('profile_image'):
                score += 0.2
            if score >= threshold:
                suspicious_nodes.append({
                    'node_id': node,
                    'bot_score': min(score, 1.0),
                    'indicators': self._get_bot_indicators(node),
                    'community': partition.get(node) if self.partitions else None
                })
        bot_subgraph = self.G.subgraph([n['node_id'] for n in suspicious_nodes])
        return {
            'suspicious_nodes': suspicious_nodes,
            'bot_clusters': list(nx.connected_components(bot_subgraph.to_undirected())),
            'coordination_score': nx.density(bot_subgraph) if bot_subgraph.number_of_nodes() > 1 else 0
        }

    def _get_bot_indicators(self, node) -> List[str]:
        indicators = []
        node_data = self.G.nodes[node]
        if node_data.get('interactions_per_day', 0) > 50:
            indicators.append('high_frequency')
        if len(set(node_data.get('topics', []))) < 3:
            indicators.append('low_topic_diversity')
        if not node_data.get('bio'):
            indicators.append('incomplete_profile')
        return indicators

    def export_for_visualization(self, filename: str, max_nodes: int = 1000):
        if self.G.number_of_nodes() > max_nodes:
            nodes = sorted(self.G.nodes(), key=lambda n: self.G.degree(n), reverse=True)[:max_nodes]
            export_graph = self.G.subgraph(nodes)
        else:
            export_graph = self.G
        for node in export_graph.nodes():
            profile = self.calculate_civic_profile(node)
            if profile:
                export_graph.nodes[node]['civic_comunidad'] = profile['civic_scores']['comunidad']
                export_graph.nodes[node]['civic_influencia'] = profile['civic_scores']['influencia']
                export_graph.nodes[node]['size'] = profile['civic_scores']['influencia'] * 100
            if self.partitions:
                export_graph.nodes[node]['community'] = self.partitions['louvain'].get(node, 0)
        nx.write_gexf(export_graph, filename)
        print(f"Exportado para visualizacion: {filename}")

    def generate_network_report(self) -> Dict:
        report = {
            'network_summary': {
                'nodes': self.G.number_of_nodes(),
                'edges': self.G.number_of_edges(),
                'density': nx.density(self.G),
                'is_connected': nx.is_connected(self.G.to_undirected()) if self.G.number_of_nodes() > 0 else False,
                'avg_clustering': nx.average_clustering(self.G.to_undirected()) if self.G.number_of_nodes() > 0 else 0
            },
            'communities': {},
            'influencers': [],
            'bridges': [],
            'bots': {},
            'recommendations': []
        }
        if self.G.number_of_nodes() > 0:
            self.detect_communities()
            report['communities'] = self.analyze_community_profiles()
            all_scores = {}
            for node in self.G.nodes():
                profile = self.calculate_civic_profile(node)
                if profile:
                    all_scores[node] = profile['civic_scores']['influencia']
            top_influencers = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)[:20]
            report['influencers'] = [
                {'node_id': n, 'influence_score': s, 'profile': self.calculate_civic_profile(n)}
                for n, s in top_influencers
            ]
            report['bridges'] = self.identify_swing_bridges(top_n=10)
            report['bots'] = self.detect_bot_networks()
            report['recommendations'] = self._generate_recommendations(report)
        return report

    def _generate_recommendations(self, report: Dict) -> List[str]:
        recommendations = []
        communities = report['communities']
        if len(communities) >= 3:
            recommendations.append("Alta fragmentacion detectada. Priorizar mensajes de los 'bridges' identificados para dialogo transversal.")
        isolated_communities = [c for c, p in communities.items() if p['civic_profile']['conexion'] < 0.3]
        if isolated_communities:
            recommendations.append(f"{len(isolated_communities)} comunidades aisladas identificadas. Disenar puentes de comunicacion especificos.")
        if report['bots'].get('suspicious_nodes'):
            recommendations.append(f"{len(report['bots']['suspicious_nodes'])} cuentas sospechosas detectadas. Recomendacion: auditoria de contenido generado.")
        top_local = [i for i in report['influencers'] if i['profile']['raw_metrics'].get('local_reach_pct', 0) > 0.5][:5]
        if top_local:
            recommendations.append(f"{len(top_local)} influencers con alto alcance local identificados. Canalizar dialogo comunitario a traves de ellos.")
        return recommendations


if __name__ == '__main__':
    print("Creando grafo sintetico de prueba...")
    G = nx.karate_club_graph()
    for node in G.nodes():
        G.nodes[node]['political_leaning'] = np.random.choice(['izquierda', 'centro', 'derecha'])
        G.nodes[node]['age_group'] = np.random.choice(['joven', 'adulto', 'mayor'])
        G.nodes[node]['location'] = (np.random.uniform(-111.2, -110.8), np.random.uniform(29.0, 29.3))
        G.nodes[node]['topics'] = np.random.choice(['seguridad', 'economia', 'salud', 'educacion'], size=3)
        G.nodes[node]['interactions_per_day'] = np.random.poisson(10)

    engine = CivicSNAEngine(G)
    report = engine.generate_network_report()

    print("
=== RESUMEN DE RED ===")
    print(f"Nodos: {report['network_summary']['nodes']}")
    print(f"Aristas: {report['network_summary']['edges']}")
    print(f"Densidad: {report['network_summary']['density']:.4f}")
    print(f"Comunidades: {len(report['communities'])}")

    print("
=== TOP 5 INFLUENCERS ===")
    for inf in report['influencers'][:5]:
        print(f"  {inf['node_id']}: score={inf['influence_score']:.4f}")

    print("
=== TOP 3 BRIDGES ===")
    for bridge in report['bridges'][:3]:
        print(f"  {bridge['node_id']}: conecta {bridge['communities_connected']} comunidades")

    print("
=== RECOMENDACIONES ===")
    for rec in report['recommendations']:
        print(f"  - {rec}")

    engine.export_for_visualization('civic_network.gexf', max_nodes=100)
