import * as vscode from 'vscode';
import fetch from 'node-fetch';

interface Thumbnail {
  targetId: number;
  state: string;
  imageUrl: string;
  width: number;
  height: number;
}

interface ThumbnailResponse {
  data: Thumbnail[];
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerHoverProvider('*', {
        async provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position, /"rbxassetid:\/\/\d+"/);
            if (range) {
                const word = document.getText(range);
                const match = word.match(/\d+/);
                if (!match) {
                    return;
                }
                const assetId = match[0];

                const response = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=110x110&format=Png`);
                
                if (!response.ok) {
                    console.error(`Error fetching thumbnail: ${response.statusText}`);
                    return;
                }

                const data = await response.json() as ThumbnailResponse;

                if (!data || !data.data || !data.data[0]) {
                    console.error('No data returned from API');
                    return;
                }

                const imageUrl = data.data[0].imageUrl;
                const hoverMessage = new vscode.MarkdownString();
                hoverMessage.value = `![Image](${imageUrl})\n\n**Asset ID:** ${assetId}`;
                hoverMessage.isTrusted = true;
                return new vscode.Hover([hoverMessage]);
            }
        }
    }));
}

export function deactivate() {}
