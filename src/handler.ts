import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';
import { ILinkType, INodeType } from './components/interfaces/GraphViewInterfaces';

/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {}
): Promise<T> {
  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(
    settings.baseUrl,
    'tvb-ext-ontology', // API Namespace
    endPoint
  );

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    throw new ServerConnection.NetworkError(error as any);
  }

  let data: any = await response.text();

  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.log('Not a JSON response body.', response);
    }
  }

  if (!response.ok) {
    throw new ServerConnection.ResponseError(response, data.message || data);
  }

  return data;
}

export async function fetchNodeByLabel(label: string): Promise<{ nodes: INodeType[]; links: ILinkType[] }> {
  try {
    const response = await requestAPI<any>(`node?label=${label}`);
    return response;
  } catch (error) {
    console.error(`Error fetching node data: ${error}`);
    return { nodes: [], links: []};
  }
}

export async function fetchNodeConnections(label: string): Promise<{ nodes: INodeType[]; links: ILinkType[] }> {
  try {
    const response = await requestAPI<{ nodes: INodeType[]; links: ILinkType[] }>(`node-connections?label=${label}`);
    return response;
  } catch (error) {
    console.error(`Error fetching node data: ${error}`);
    return { nodes: [], links: [] };
  }
}

export async function fetchNodeChildren(label: string, id: string): Promise<{ nodes: INodeType[]; links: ILinkType[] }> {
  try {
    const response = await requestAPI<{ nodes: INodeType[]; links: ILinkType[] }>(`node-children-connections?label=${label}&id=${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching node data: ${error}`);
    return { nodes: [], links: [] };
  }
}

export async function fetchNodeParents(label: string, id: string): Promise<{ nodes: INodeType[]; links: ILinkType[] }> {
  try {
    const response = await requestAPI<{ nodes: INodeType[]; links: ILinkType[] }>(`node-parent-connections?label=${label}&id=${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching node data: ${error}`);
    return { nodes: [], links: [] };
  }
}

export async function exportWorkspace(exportType: string, nodeData: { [key: string]: string }, directory: string) {
  try {
    // Retrieve the _xsrf token from cookies
    const xsrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('_xsrf='))
      ?.split('=')[1];

    const response = await fetch('/tvb-ext-ontology/export-workspace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRFToken': xsrfToken || ''
      },
      body: JSON.stringify({
        exportType,
        data: nodeData,
        directory
      })
    });

    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to export the file.');
    }
  } catch (error) {
    console.error('Error during export:', error);
    throw error;
  }
}

export async function runSimulation(exportType: string, nodeData: { [key: string]: string }, filename: string) {
  try {
    const xsrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('_xsrf='))
      ?.split('=')[1];

    const response = await fetch('/tvb-ext-ontology/run-simulation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRFToken': xsrfToken || ''
      },
      body: JSON.stringify({
        exportType,
        data: nodeData,
        filename
      })
    });

    if (response.ok) {
      return response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to export the file.');
    }
  } catch (error) {
    console.error('Error during simulation run:', error);
    throw error;
  }
}
