import * as vscode from 'vscode'

import type { PluginConfig } from '~/types'

const config = vscode.workspace.getConfiguration('crayon-box') as vscode.WorkspaceConfiguration & PluginConfig

export default config
