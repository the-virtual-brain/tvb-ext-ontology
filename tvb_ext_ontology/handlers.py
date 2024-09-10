import json
import os

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from tvbo.api.ontology_api import OntologyAPI

onto_api = OntologyAPI()


def custom_get(data, key, default):
    """
    Custom get function that returns the default value if the key is missing or
    if the value is explicitly the string "None".

    Args:
    data (dict): Dictionary to fetch values from.
    key (str): Key to lookup in the dictionary.
    default (Any): Default value to return if the key is not found or the value is "None".

    Returns:
    Any: Value corresponding to the key in the dictionary or the default value.
    """
    return data.get(key, default) if data.get(key, default) != "None" else default


class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(
            json.dumps({"data": "This is /tvb-ext-ontology/get-example endpoint!"})
        )


class NodeHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        label = self.get_argument("label", None)
        if not label:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'label' parameter"}))
            return

        node_data = onto_api.get_node_by_label(label)
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No data found for label: {label}"}))
            return

        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(node_data))


class NodeConnectionsHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        label = self.get_argument("label", None)
        if not label:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'label' parameter"}))
            return

        onto_api.expand_node_relationships(label)
        nodes = onto_api.nodes
        links = onto_api.edges
        node_data = {"nodes": nodes, "links": links}
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No data found for label: {label}"}))
            return

        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(node_data))


class NodeChildrenConnectionsHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        label = self.get_argument("label", None)
        id = self.get_argument("id", None)
        if not label:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'label' parameter"}))
            return
        if not id:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'ID' parameter"}))
            return
        onto_api.expand_node_relationships(label)
        node_data = onto_api.get_child_connections(id)
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No data found for label: {label}"}))
            return

        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(node_data))


class NodeParentConnectionsHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        label = self.get_argument("label", None)
        id = self.get_argument("id", None)
        if not label:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'label' parameter"}))
            return
        if not id:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'ID' parameter"}))
            return
        onto_api.expand_node_relationships(label)
        node_data = onto_api.get_parent_connections(id)
        print(f"node_data: {node_data}")
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No data found for label: {label}"}))
            return

        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(node_data))


class InvalidDirectoryException(Exception):
    """ Custom class for invalid directory paths"""
    pass


class ExportWorkspaceHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        try:
            # parse the request JSON body
            data = json.loads(self.request.body.decode("utf-8"))
            export_type = data.get("exportType", "txt")
            nodes_data = data.get("data", {})
            directory = data.get("directory", '')

            # validate directory
            print(f'Validating path {directory}')
            if directory == '':
                directory = os.getcwd()
            if not os.path.isdir(directory):
                raise InvalidDirectoryException(f'Invalid directory path: \"{directory}\"')

            metadata = construct_metadata(nodes_data)
            print(f'Created the metadata: {metadata}')

            onto_api.configure_simulation_experiment(metadata)
            print('Configured simulation experiment')

            onto_api.experiment.save_code(directory)
            print('Saved code')

            # Send a JSON response indicating success
            self.set_header("Content-Type", "application/json")
            self.finish(
                json.dumps(
                    {"status": "success", "message": f"File saved in folder {directory}"}
                )
            )
        except InvalidDirectoryException as e:
            self.set_status(400)
            self.set_header("Content-Type", "application/json")
            self.finish(json.dumps({"error": str(e)}))

        except Exception as e:
            self.set_status(500)
            self.set_header("Content-Type", "application/json")
            self.finish(json.dumps({"error": str(e)}))


class RunSimulationHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        try:
            # Parse the request JSON body
            data = json.loads(self.request.body.decode("utf-8"))
            nodes_data = data.get("data", {})
            directory = data.get("directory", '')

            # validate directory
            print(f'Validating path {directory}')
            if directory == '':
                directory = os.getcwd()
            if not os.path.isdir(directory):
                raise InvalidDirectoryException(f'Invalid directory path: \"{directory}\"')
            metadata = construct_metadata(nodes_data)

            print(f'Created the metadata: {metadata}')

            onto_api.configure_simulation_experiment(metadata)
            print('Configured simulation experiment')

            # run simulation
            print('Starting to run the experiment')
            onto_api.experiment.run()
            print('Finished the experiment')

            # save TS to disk
            print('Saving TS')
            onto_api.experiment.save_timeseries(directory)
            print(f'Saved TS at {directory}')

            # Send a JSON response indicating success
            self.set_header("Content-Type", "application/json")
            self.finish(
                json.dumps(
                    {"status": "success", "message": f"Saved simulation results in folder {directory}"}
                )
            )
        except InvalidDirectoryException as e:
            self.set_status(400)
            self.set_header("Content-Type", "application/json")
            self.finish(json.dumps({"error": str(e)}))

        except Exception as e:
            self.set_status(500)
            self.set_header("Content-Type", "application/json")
            self.finish(json.dumps({"error": str(e)}))


def construct_metadata(nodes_data):
    """
    Construct the metadata dictionary using the data coming from the configured workspace
    Parameters
    ----------
    nodes_data:
        dict containing the data configured in the workspace
    Returns
    -------
    metadata:
        dict contaning the metadata that will be used in exporting the code or running a simulation
    """
    metadata = {
        "model": {
            "label": custom_get(nodes_data, "model", "Generic2dOscillator"),
            "parameters": {},
        },
        "connectivity": {
            "parcellation": {
                "atlas": {
                    "name": custom_get(
                        nodes_data, "parcellation", "DesikanKilliany"
                    ),
                }
            },
            "tractogram": {
                "label": custom_get(nodes_data, "tractogram", "dTOR"),
            },
        },
        "coupling": {
            "label": custom_get(nodes_data, "coupling", "Linear"),
        },
        "integration": {
            "method": custom_get(nodes_data, "integrationMethod", "Heun"),
            "noise": custom_get(nodes_data, "noise", None),
        },
    }
    return metadata


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "tvb-ext-ontology", "get-example")
    node_pattern = url_path_join(base_url, "tvb-ext-ontology", "node")
    node_connections_pattern = url_path_join(
        base_url, "tvb-ext-ontology", "node-connections"
    )
    node_children_connections_pattern = url_path_join(
        base_url, "tvb-ext-ontology", "node-children-connections"
    )
    node_parent_connections_pattern = url_path_join(
        base_url, "tvb-ext-ontology", "node-parent-connections"
    )
    export_workspace_pattern = url_path_join(
        base_url, "tvb-ext-ontology", "export-workspace"
    )

    run_simulation_pattern = url_path_join(
        base_url, "tvb-ext-ontology", "run-simulation"
    )

    handlers = [
        (route_pattern, RouteHandler),
        (node_pattern, NodeHandler),
        (node_connections_pattern, NodeConnectionsHandler),
        (node_children_connections_pattern, NodeChildrenConnectionsHandler),
        (node_parent_connections_pattern, NodeParentConnectionsHandler),
        (export_workspace_pattern, ExportWorkspaceHandler),
        (run_simulation_pattern, RunSimulationHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)
