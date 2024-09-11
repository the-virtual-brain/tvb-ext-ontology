import json
import os

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from tvbo.api.ontology_api import OntologyAPI

from tvb_ext_ontology.exceptions import InvalidDirectoryException
from tvb_ext_ontology.logger.builder import get_logger

LOGGER = get_logger(__name__)

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

        LOGGER.info(f'Querying ontology for nodes with label: {label}')
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
            self.finish(json.dumps({"error": f"No connections found found for node: {label}"}))
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
        LOGGER.info(f'Searching for children for node: {label} with id {id}')
        onto_api.expand_node_relationships(label)
        node_data = onto_api.get_child_connections(id)
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No children found for node {label} with id {id}"}))
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
        LOGGER.info(f'Searching for parents for node: {label} with id {id}')
        onto_api.expand_node_relationships(label)
        node_data = onto_api.get_parent_connections(id)
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No parents found for node {label} with id {id}"}))
            return

        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(node_data))


class ExportWorkspaceHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        try:
            # parse the request JSON body
            data = json.loads(self.request.body.decode("utf-8"))
            export_type = data.get("exportType", "txt")
            nodes_data = data.get("data", {})
            directory = data.get("directory", '')
            LOGGER.info('Workspace data coming from extension:')
            LOGGER.info(f'Export type: {export_type}')
            LOGGER.info(f'Node data: {nodes_data}')
            LOGGER.info(f'Directory path: {directory}')

            # validate directory
            LOGGER.info(f'Validating path {directory}')
            if directory == '':
                directory = os.getcwd()
            if not os.path.isdir(directory):
                raise InvalidDirectoryException(f'Invalid directory path: \"{directory}\"')

            metadata = construct_metadata(nodes_data)
            LOGGER.info(f'Created the metadata: {metadata}')

            onto_api.configure_simulation_experiment(metadata)
            LOGGER.info('Configured simulation experiment')

            # treat different export type options
            if export_type == 'py':
                onto_api.experiment.save_code(directory)
                LOGGER.info('Saved code')
            elif export_type == 'xml':
                onto_api.experiment.save_model_specification(directory)
                LOGGER.info('Saved model specification')
            elif export_type == 'yaml':
                onto_api.experiment.save_metadata(directory)
                LOGGER.info('Saved metadata')

            # send success json
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
            export_type = data.get("export-type", "py")
            directory = data.get("directory", '')
            LOGGER.info('Workspace data coming from extension:')
            LOGGER.info(f'Export type: {export_type}')
            LOGGER.info(f'Node data: {nodes_data}')
            LOGGER.info(f'Directory path: {directory}')

            # validate directory
            LOGGER.info(f'Validating path {directory}')
            if directory == '':
                directory = os.getcwd()
            if not os.path.isdir(directory):
                raise InvalidDirectoryException(f'Invalid directory path: \"{directory}\"')
            metadata = construct_metadata(nodes_data)

            LOGGER.info(f'Created the metadata: {metadata}')

            onto_api.configure_simulation_experiment(metadata)
            LOGGER.info('Configured simulation experiment')

            # run simulation
            LOGGER.info('Starting to run the experiment')
            onto_api.experiment.run(simulation_length=10)
            LOGGER.info('Finished the experiment')

            # save TS to disk
            LOGGER.info('Saving Time Series...')
            onto_api.experiment.save_timeseries(directory)
            LOGGER.info(f'Saved Time Series at {directory}')

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
