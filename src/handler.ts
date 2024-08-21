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

export async function fetchNodeByLabel(label: string): Promise<any> {
  try {
    const response = await requestAPI<any>(`node?label=${label}`);
    return response;
  } catch (error) {
    console.error(`Error fetching node data: ${error}`);
  }
}

export async function fetchNodeConnections(label: string): Promise<{ nodes: INodeType[]; links: ILinkType[] } | null> {
  try {
    const response = await requestAPI<{ nodes: INodeType[]; links: ILinkType[] }>(`node-connections?label=${label}`);
    return response;
  } catch (error) {
    console.error(`Error fetching node data: ${error}`);
    return null;
  }
}
