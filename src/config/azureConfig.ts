
// Azure services configuration
export const azureConfig = {
  sqlServer: {
    server: '52.138.81.37',
    database: 'AppsDataTeam',
    username: 'dali',
    password: 'bogota.2014',
    authentication: 'SQL Server Authentication'
  },
  
  blobStorage: {
    accountName: 'aistudiojarvis0534199251',
    accountKey: 'Q2Fvevii866hDSdTamhAGta2RDiYnyaOsjJVF/O16KSS1UcFgpZc6iwpz2UsMC6ybKyiUxhHZ1B1+AStW9+4uw==',
    connectionString: `DefaultEndpointsProtocol=https;AccountName=aistudiojarvis0534199251;AccountKey=Q2Fvevii866hDSdTamhAGta2RDiYnyaOsjJVF/O16KSS1UcFgpZc6iwpz2UsMC6ybKyiUxhHZ1B1+AStW9+4uw==;EndpointSuffix=core.windows.net`
  },
  
  cosmosDb: {
    endpoint: 'https://skco-jarvis-dev.documents.azure.com:443/',
    key: 'efCJb7ptlB2FggMMt1eyE5ZRK43nuGh9S9zFyh7AhYzoX7BqiWliXJb4HuKgRhvi9NWC2LVmqoX9ACDbc7qoBA==',
    connectionString: 'AccountEndpoint=https://skco-jarvis-dev.documents.azure.com:443/;AccountKey=efCJb7ptlB2FggMMt1eyE5ZRK43nuGh9S9zFyh7AhYzoX7BqiWliXJb4HuKgRhvi9NWC2LVmqoX9ACDbc7qoBA==;',
    databaseName: 'JarvisDB',
    containers: {
      conversations: 'conversations',
      templates: 'templates',
      configurations: 'configurations',
      eventLogs: 'eventLogs'
    }
  }
};
