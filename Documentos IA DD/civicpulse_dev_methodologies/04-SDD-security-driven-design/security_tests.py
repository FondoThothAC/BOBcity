#!/usr/bin/env python3
# security_tests.py - SDD Security Validation Suite

import pytest
import hashlib
import json
import ssl
import socket
from datetime import datetime
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ed25519

class TestEncryption:

    def test_tls_1_3_only(self):
        context = ssl.create_default_context()
        context.minimum_version = ssl.TLSVersion.TLSv1_3
        with socket.create_connection(("api.civicpulse.local", 443)) as sock:
            with context.wrap_socket(sock, server_hostname="api.civicpulse.local") as ssock:
                assert ssock.version() == "TLSv1.3"

    def test_certificate_pinning(self):
        expected_pin = "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
        cert = ssl.get_server_certificate(("api.civicpulse.local", 443))
        cert_der = ssl.PEM_cert_to_DER_cert(cert)
        actual_pin = "sha256/" + hashlib.sha256(cert_der).digest().hex()
        assert actual_pin == expected_pin

class TestDifferentialPrivacy:

    def test_epsilon_bound(self):
        from civicpulse.privacy import add_laplace_noise
        import numpy as np
        epsilon = 0.5
        results = [add_laplace_noise(100, epsilon) for _ in range(1000)]
        assert abs(np.mean(results) - 100) < 5
        assert np.std(results) < 3 / epsilon

    def test_k_anonymity(self):
        datos = [
            {"colonia": "A", "edad": 25, "ingreso": 15000},
            {"colonia": "A", "edad": 26, "ingreso": 15500},
            {"colonia": "B", "edad": 40, "ingreso": 30000},
        ]
        from civicpulse.privacy import ensure_k_anonymity
        anonimizados = ensure_k_anonymity(datos, k=2, quasi_identifiers=['colonia'])
        colonias = [d['colonia'] for d in anonimizados]
        assert colonias.count('B') == 0 or colonias.count('B') >= 2

class TestAuditIntegrity:

    def test_ledger_immutable(self):
        from civicpulse.security import Ledger
        ledger = Ledger()
        ledger.append("operacion_1", {"dato": "valor1"})
        ledger.append("operacion_2", {"dato": "valor2"})
        hash_original = ledger.verify_chain()
        assert hash_original == True
        ledger.chain[0].data = {"dato": "alterado"}
        hash_modificado = ledger.verify_chain()
        assert hash_modificado == False

    def test_signature_valid(self):
        private_key = ed25519.Ed25519PrivateKey.generate()
        public_key = private_key.public_key()
        message = b"operacion_critica: export_obp"
        signature = private_key.sign(message)
        assert public_key.verify(signature, message) == None

class TestAccessControl:

    def test_rbac_ciudadano_no_predictor(self):
        from civicpulse.auth import check_permission
        assert check_permission(role='ciudadano', resource='predictor') == False
        assert check_permission(role='estratega', resource='predictor') == True

    def test_rbac_admin_no_datos_crudos(self):
        from civicpulse.auth import check_permission
        assert check_permission(role='admin', resource='datos_ine_crudos') == False
        assert check_permission(role='cientifico_datos', resource='datos_ine_crudos') == True

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
