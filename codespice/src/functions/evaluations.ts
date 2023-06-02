import * as vscode from 'vscode';
import * as file_eval from './file_evaluation';
import * as func_eval from './func_evaluation';
import * as var_eval from './vars_evaluation';
import * as macro_eval from './macros_evaluation';

export function evaluateAll(
    scanningActive: { value: boolean },
    configuration: any,
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
                configuration,
                diagnosticCollection
            );
            file_eval.evaluateCommenting(
                editor,
                configuration,
                // requireCommentHeader,
                diagnosticCollection
            );
            file_eval.evaluateNamingConventions(
                editor,
                configuration,
                diagnosticCollection
            );
            func_eval.evaluateFunctions(
                editor,
                configuration,
                diagnosticCollection
            );

            var_eval.checkUninitializedVariables(editor, diagnosticCollection);

            macro_eval.isMacroEnclosedWithDoWhile(
                editor,
                configuration,
                diagnosticCollection);
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
