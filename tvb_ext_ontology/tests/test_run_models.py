# import unittest
# from tvbo.api import ontology_api
# from tvbo.knowledge.ontology import get_models
#
#
# class TestOntologyAPI(unittest.TestCase):
#
#     def test_simulation_experiment(self):
#         models = get_models().keys()  # Fetch actual models
#         api = ontology_api.OntologyAPI()  # Initialize real API
#
#         for m in models:
#             metadata = {
#                 "model": {"label": m, "parameters": {}},
#                 "connectivity": {
#                     "parcellation": {"atlas": {"name": "Destrieux"}},
#                     "tractogram": {"label": "PPMI85"},
#                 },
#                 "coupling": {"label": "Linear"},
#                 "integration": {"method": "Heun", "noise": None},
#             }
#             # Configure and run the simulation experiment
#             api.configure_simulation_experiment(metadata)
#             api.experiment.run(simulation_length=10)
#
#
# if __name__ == "__main__":
#     unittest.main()
