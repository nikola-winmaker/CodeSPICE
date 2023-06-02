import * as vscode from 'vscode';
import * as file_eval from './file_evaluation';
import * as func_eval from './func_evaluation';


export function evaluateAll(
    scanningActive: { value: boolean },
    maxLineCount: number,
    maxLineLength: number,
    requireCommentHeader: boolean,
    namingConventions: any,
    maxCyclomatic: number,
    maxFunctionLines: number,
    maxFunctionParams: number,
    diagnosticCollection: vscode.DiagnosticCollection
) {
    if (!scanningActive.value) {
        return;
    }

    function evaluateEditor(editor: vscode.TextEditor) {

        if (!scanningActive.value) {
            return;
        }

        const allowedExtensions = ['.c', '.cpp', '.h', '.hpp'];
        const fileExtension = editor.document.fileName.split('.').pop();

        if (allowedExtensions.includes(`.${fileExtension}`)) {

            const lineCount = editor.document.lineCount;
            file_eval.evaluateLineCount(
                editor,
                lineCount,
                maxLineCount,
                maxLineLength,
                diagnosticCollection
            );
            file_eval.evaluateCommenting(
                editor,
                requireCommentHeader,
                diagnosticCollection
            );
            file_eval.evaluateNamingConventions(
                editor,
                namingConventions,
                diagnosticCollection
            );
            func_eval.evaluateFunctions(
                editor,
                maxCyclomatic,
                maxFunctionLines,
                maxFunctionParams,
                diagnosticCollection
            );
        }
    }

    function evaluateActiveTextDocument() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            evaluateEditor(editor);
        }
    }

    function evaluateAffectedEditors(document: vscode.TextDocument) {
        const affectedEditors = vscode.window.visibleTextEditors.filter(
            (editor) => editor.document === document
        );
        affectedEditors.forEach(evaluateEditor);
    }

    vscode.window.visibleTextEditors.forEach(evaluateEditor);

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (scanningActive.value) {
            if (vscode.window.activeTextEditor?.document === event.document) {
                evaluateEditor(vscode.window.activeTextEditor);
            }
            evaluateAffectedEditors(event.document);
        }
    });

    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (scanningActive.value && editor) {
            evaluateEditor(editor);
        }
    });

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (scanningActive.value) {
            evaluateAffectedEditors(event.document);
        }
    });
}
