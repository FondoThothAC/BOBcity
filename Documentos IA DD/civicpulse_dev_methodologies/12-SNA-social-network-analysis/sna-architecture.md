# Social Network Analysis - CivicPulse

## Metodologia: De Cambridge Analytica a CivicPulse Etico

### Lo que hizo Cambridge Analytica (y por que fue ilegal)
1. **Extraccion no consentida** de datos de 87M usuarios Facebook via app "This Is Your Digital Life"
2. **Modelo OCEAN** (Big Five) inferido de likes: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
3. **Microtargeting psicografico**: anuncios personalizados por perfil psicologico
4. **Dark posts**: anuncios invisibles al publico general, solo al target
5. **Voter suppression**: dirigir a grupos especificos para que NO votaran

### Lo que hace CivicPulse (etico, transparente, consentido)
1. **Datos solo con consentimiento explicito** granular
2. **Anonimizacion diferencial** en todas las agregaciones
3. **Modelo CIVIC** (adaptacion etica): Comunidad, Interes, Valores, Influencia, Conexion
4. **Macrotargeting para politicas publicas**, no microtargeting para manipulacion
5. **Auditoria publica** de todos los algoritmos y datasets

## Modelo CIVIC (adaptacion etica de OCEAN)

| Dimension | Descripcion | Indicadores de Red | Uso en CivicPulse |
|-----------|-------------|-------------------|-------------------|
| **C** - Comunidad | Sentido de pertenencia local | Centralidad en subredes geograficas, clustering coefficient | Identificar lideres comunitarios naturales |
| **I** - Interes | Temas que movilizan al individuo | Topicos dominantes en contenido generado, hashtags recurrentes | Mapear agendas ciudadanas prioritarias |
| **V** - Valores | Principios declarados y observados | Homofilia en red (con quien se conecta), alianzas ideologicas | Segmentar por valores, no por manipulacion |
| **I** - Influencia | Capacidad de persuadir a otros | Betweenness centrality, eigenvector centrality, PageRank | Identificar influencers locales para dialogo |
| **C** - Conexion | Diversidad de redes sociales | Degree centrality, bridges entre clusters, structural holes | Mediar entre grupos polarizados |

## Fuentes de Datos para SNA en Mexico

| Fuente | Tipo de Red | Datos Disponibles | Etica/Legalidad |
|--------|-------------|-------------------|-----------------|
| **Twitter/X API v2** | Red de seguidores, interacciones | Tweets, retweets, mentions, followers (public) | API terms, solo public data |
| **Facebook Pages** | Red de paginas politicas | Interacciones publicas en paginas oficiales | Public data, no privados |
| **WhatsApp (encuestas)** | Red declarada por usuario | Contactos frecuentes, grupos (self-reported) | Consentimiento explicito |
| **INE Padron** | Red geografica | Seccion electoral, colonia (agregado) | Public domain, anonimizado |
| **Encuestas de Opinion** | Red percibida | "Con quien habla de politica" (survey) | Consentimiento |
| **OpenStreetMap** | Red de lugares | Lugares frecuentados, rutas | ODbL license |

## Metricas de Red para Campanas Politicas

### Nivel Individual (Micro)
| Metrica | Interpretacion Politica |
|---------|------------------------|
| **Degree Centrality** | Popularidad directa, alcance inmediato |
| **Betweenness Centrality** | Puente entre grupos, "broker" de informacion |
| **Eigenvector Centrality** | Influencia por conexion con otros influencers |
| **PageRank** | Autoridad en la red, "quien escucha a quien" |
| **Clustering Coefficient** | Cohesion del circulo cercano, "echo chamber" |
| **Structural Holes** | Oportunidad de controlar flujo de informacion |

### Nivel Comunitario (Meso)
| Metrica | Interpretacion |
|---------|---------------|
| **Modularity (Q)** | Fuerza de comunidades/echo chambers |
| **Community Detection** | Identificar grupos de opinion |
| **Homophily Index** | Tendencia a conectarse con similares |
| **Polarization Index** | Grado de polarizacion de la red |

### Nivel Sistema (Macro)
| Metrica | Interpretacion |
|---------|---------------|
| **Network Density** | Cohesion general del tejido social |
| **Average Path Length** | Velocidad de difusion de informacion |
| **Diameter** | Maxima distancia social |
| **Small-Worldness** | Eficiencia de difusion vs aleatorio |

## Deteccion de Comunidades para Segmentacion

```python
import networkx as nx
import community as community_louvain
from collections import defaultdict

class PoliticalCommunityDetector:
    def __init__(self, graph: nx.Graph):
        self.G = graph
        self.partitions = {}

    def detect_communities(self, method='louvain', resolution=1.0):
        if method == 'louvain':
            partition = community_louvain.best_partition(
                self.G, resolution=resolution
            )
        self.partitions[method] = partition
        return partition

    def analyze_community_profiles(self, partition):
        communities = defaultdict(list)
        for node, comm_id in partition.items():
            communities[comm_id].append(node)

        profiles = {}
        for comm_id, members in communities.items():
            attrs = [self.G.nodes[n] for n in members]
            profiles[comm_id] = {
                'size': len(members),
                'dominant_topics': self._extract_topics(attrs),
                'sentiment_avg': np.mean([a['sentiment'] for a in attrs]),
                'influence_score': np.mean([a.get('pagerank', 0) for a in attrs]),
                'geographic_concentration': self._geo_concentration(members),
                'political_leaning': self._infer_leaning(attrs),
                'mobilization_potential': self._mobilization_score(members)
            }
        return profiles

    def _mobilization_score(self, members):
        centralities = [self.G.nodes[m].get('betweenness', 0) for m in members]
        engagements = [self.G.nodes[m].get('engagement_rate', 0) for m in members]
        return (np.mean(centralities) * 0.4 + np.mean(engagements) * 0.6)

    def identify_bridging_nodes(self, partition, top_n=20):
        bridges = []
        for node in self.G.nodes():
            neighbors = list(self.G.neighbors(node))
            neighbor_communities = set(partition.get(n) for n in neighbors)
            if len(neighbor_communities) > 1:
                bridges.append({
                    'node': node,
                    'communities_connected': len(neighbor_communities),
                    'betweenness': nx.betweenness_centrality(self.G)[node],
                    'community_diversity_score': len(neighbor_communities) / len(neighbors)
                })
        return sorted(bridges, key=lambda x: x['betweenness'], reverse=True)[:top_n]
```

## Influencer Mapping Local

```python
class LocalInfluencerMapper:
    def __init__(self, social_graph, geographic_bounds):
        self.G = social_graph
        self.bounds = geographic_bounds

    def calculate_real_influence(self, node, depth=2):
        visited = {node: 0}
        queue = [(node, 0)]
        influence_score = 0

        while queue:
            current, dist = queue.pop(0)
            if dist >= depth:
                continue

            for neighbor in self.G.neighbors(current):
                if neighbor not in visited:
                    edge_weight = self.G[current][neighbor].get('weight', 1)
                    decay = 0.5 ** dist
                    influence_score += edge_weight * decay
                    visited[neighbor] = dist + 1
                    queue.append((neighbor, dist + 1))

        return influence_score

    def identify_opinion_leaders(self, method='composite'):
        metrics = {
            'pagerank': nx.pagerank(self.G),
            'betweenness': nx.betweenness_centrality(self.G),
            'eigenvector': nx.eigenvector_centrality(self.G, max_iter=1000),
            'in_degree': dict(self.G.in_degree()) if self.G.is_directed() else dict(self.G.degree())
        }

        scores = {}
        for node in self.G.nodes():
            scores[node] = (
                metrics['pagerank'].get(node, 0) * 0.35 +
                metrics['betweenness'].get(node, 0) * 0.25 +
                metrics['eigenvector'].get(node, 0) * 0.25 +
                (metrics['in_degree'].get(node, 0) / max(metrics['in_degree'].values())) * 0.15
            )

        return sorted(scores.items(), key=lambda x: x[1], reverse=True)

    def map_influence_geography(self):
        influencers = self.identify_opinion_leaders()[:50]
        geo_influence = []

        for node_id, score in influencers:
            node_data = self.G.nodes[node_id]
            followers_in_area = [
                n for n in self.G.neighbors(node_id)
                if self._distance(node_data['location'], self.G.nodes[n]['location']) < 5
            ]

            geo_influence.append({
                'influencer_id': node_id,
                'location': node_data['location'],
                'influence_score': score,
                'local_reach': len(followers_in_area),
                'local_reach_pct': len(followers_in_area) / self.G.degree(node_id),
                'topics': node_data.get('topics', [])
            })

        return geo_influence
```

## Deteccion de Bots y Desinformacion

```python
class BotDetector:
    def __init__(self, graph):
        self.G = graph

    def calculate_bot_score(self, node):
        features = {
            'clustering': nx.clustering(self.G, node),
            'degree_ratio': self.G.degree(node) / max(dict(self.G.degree()).values()),
            'reciprocity': self._reciprocity(node),
            'tweet_velocity': self.G.nodes[node].get('tweets_per_day', 0),
            'account_age_days': self.G.nodes[node].get('account_age_days', 365),
            'retweet_ratio': self.G.nodes[node].get('retweet_ratio', 0.5),
            'mention_diversity': self._mention_diversity(node),
            'hashtag_repetition': self.G.nodes[node].get('hashtag_repetition', 0)
        }

        bot_score = (
            (features['tweet_velocity'] > 50) * 0.2 +
            (features['account_age_days'] < 30) * 0.15 +
            (features['retweet_ratio'] > 0.9) * 0.2 +
            (features['clustering'] > 0.8) * 0.15 +
            (features['hashtag_repetition'] > 0.7) * 0.15 +
            (features['mention_diversity'] < 0.1) * 0.15
        )

        return min(bot_score, 1.0)

    def detect_astroturfing(self, topic, time_window='7d'):
        astroturf_score = {}
        for node in self.G.nodes():
            if self.G.nodes[node].get('recent_topic_engagement', {}).get(topic, 0) > 0.8:
                score = (
                    (self.G.nodes[node].get('account_age_days', 365) < 60) * 0.4 +
                    (self.calculate_bot_score(node) > 0.5) * 0.3 +
                    (self.G.nodes[node].get('previous_political_posts', 0) < 5) * 0.3
                )
                astroturf_score[node] = score

        return sorted(astroturf_score.items(), key=lambda x: x[1], reverse=True)
```

## Analisis de Difusion de Informacion

```python
class InformationDiffusionAnalyzer:
    def __init__(self, temporal_graph):
        self.G = temporal_graph

    def trace_cascade(self, source_node, content_hash, max_depth=10):
        cascade = {
            'source': source_node,
            'content': content_hash,
            'reach': 0,
            'depth': 0,
            'velocity': 0
        }

        visited = {source_node: {'parent': None, 'time': 0, 'depth': 0}}
        queue = [(source_node, 0)]

        while queue:
            current, depth = queue.pop(0)
            if depth >= max_depth:
                continue

            for neighbor in self.G.neighbors(current):
                edge_time = self.G[current][neighbor].get('timestamp', 0)
                current_time = visited[current]['time']

                if edge_time > current_time and neighbor not in visited:
                    visited[neighbor] = {
                        'parent': current,
                        'time': edge_time,
                        'depth': depth + 1
                    }
                    queue.append((neighbor, depth + 1))

        cascade['reach'] = len(visited)
        cascade['depth'] = max(v['depth'] for v in visited.values())

        return cascade

    def identify_super_spreaders(self, content_hashes, min_reach=1000):
        spreader_scores = defaultdict(list)

        for content in content_hashes:
            edges = [(u, v, d['timestamp']) for u, v, d in self.G.edges(data=True)
                     if d.get('content_hash') == content]

            if edges:
                edges.sort(key=lambda x: x[2])
                source = edges[0][0]
                cascade = self.trace_cascade(source, content)

                if cascade['reach'] >= min_reach:
                    spreader_scores[source].append(cascade['reach'])

        avg_reach = {k: np.mean(v) for k, v in spreader_scores.items()}
        return sorted(avg_reach.items(), key=lambda x: x[1], reverse=True)
```
