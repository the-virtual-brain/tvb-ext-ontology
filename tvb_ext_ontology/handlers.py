import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from tvbo.api.ontology_api import OntologyAPI


class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /tvb-ext-ontology/get-example endpoint!"
        }))


class NodeHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        label = self.get_argument('label', None)
        if not label:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'label' parameter"}))
            return

        onto_api = OntologyAPI()
        node_data = onto_api.query_nodes(label)
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No data found for label: {label}"}))
            return

        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(node_data))


class NodeConnectionsHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        label = self.get_argument('label', None)
        if not label:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'label' parameter"}))
            return

        onto_api = OntologyAPI()
        node_data = onto_api.expand_node_relationships(label)
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No data found for label: {label}"}))
            return

        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(node_data))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "tvb-ext-ontology", "get-example")
    node_pattern = url_path_join(base_url, "tvb-ext-ontology", "node")
    node_connections_pattern = url_path_join(base_url, "tvb-ext-ontology", "node-connections")

    handlers = [
        (route_pattern, RouteHandler),
        (node_pattern, NodeHandler),
        (node_connections_pattern, NodeConnectionsHandler)
    ]
    web_app.add_handlers(host_pattern, handlers)
