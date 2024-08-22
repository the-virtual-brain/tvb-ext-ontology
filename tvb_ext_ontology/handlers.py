import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from tvbo.api.ontology_api import OntologyAPI

onto_api = OntologyAPI()


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
        label = self.get_argument('label', None)
        if not label:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'label' parameter"}))
            return

        onto_api.expand_node_relationships(label)
        nodes = onto_api.nodes
        links = onto_api.edges
        node_data = {'nodes': nodes, 'links': links}
        if not node_data:
            self.set_status(404)
            self.finish(json.dumps({"error": f"No data found for label: {label}"}))
            return

        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(node_data))


class NodeChildrenConnectionsHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        label = self.get_argument('label', None)
        id = self.get_argument('id', None)
        if not label:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'label' parameter"}))
            return
        if not id:
            self.set_status(400)
            self.finish(json.dumps({"error": "Missing 'ID' parameter"}))
            return
        print(f'Label: {label}')
        print(f'ID: {id}')
        onto_api.expand_node_relationships(label)
        # print(onto_api.nodes)
        node_data = onto_api.get_child_connections(id)
        print(f'node_data: {node_data}')
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
    node_children_connections_pattern = url_path_join(base_url, "tvb-ext-ontology", "node-children-connections")

    handlers = [
        (route_pattern, RouteHandler),
        (node_pattern, NodeHandler),
        (node_connections_pattern, NodeConnectionsHandler),
        (node_children_connections_pattern, NodeChildrenConnectionsHandler)
    ]
    web_app.add_handlers(host_pattern, handlers)
