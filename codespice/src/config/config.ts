import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


export function loadJsonConfiguration(configuration: any) {
    const configurationPath = vscode.workspace.getConfiguration('codespice').get<string>('jsonConfigurationPath') ?? '';

    if (configurationPath) {
        const absolutePath = path.isAbsolute(configurationPath)
            ? configurationPath
            : path.join(vscode.workspace.rootPath || '', configurationPath);

        if (fs.existsSync(absolutePath)) {
            const fileContent = fs.readFileSync(absolutePath, 'utf8');
            try {
                const parsedConfiguration = JSON.parse(fileContent);
                console.log('JSON configuration loaded successfully.');
        
                // Update the configuration object with the loaded configuration
                Object.assign(configuration, parsedConfiguration);
            } catch (error) {
                console.error('Failed to parse the JSON configuration file:', error);
            }
        } else {
            console.error('The specified JSON configuration file does not exist.');
        }
    } else {
        console.error('No JSON configuration file path specified.');
    }
}

export function browseJsonConfiguration() {
    vscode.window.showOpenDialog({
        filters: {
            'jsonFiles': ['json']
        }
    }).then((fileUri) => {
        if (fileUri && fileUri[0]) {
            const configurationPath = fileUri[0].fsPath;
            vscode.workspace.getConfiguration('codespice').update('jsonConfigurationPath', configurationPath, vscode.ConfigurationTarget.Workspace);
        }
    });
}
