## Extension Settings

For example:

This extension has the following settings:

* `codespice.jsonConfigurationPath`: Path to json configuration for coding guideline.
* `codespice.start`: Enable code extension.
* `codespice.stop`: Stop code extension.

User ctrl+shift+p and type CodeSpice for command options.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Following features are implemented:
* Naming convention check
* Line length
* File header comment missing 
* File length check
* Function cyclomatic complexity, maximum lines, and maximum parameters.

---

## Following extension guidelines

Make sure to provide configuration in json format:
{
  "indentation": {
    "type": "spaces",
    "size": 4
  },
  "namingConventions": {
    "variable": "snake_case",
    "function": "snake_case",
    "constant": "UPPER_CASE"
  },
  "spacing": {
    "aroundOperators": true,
    "beforeBraces": true
  },
  "lineLength": {
    "maxLength": 80
  },
  "commenting": {
    "requireHeader": true
  },
  "fileLength": {
    "maxLines": 500
  },
  "function": {
    "maxCyclomatic": 10,
    "maxLines": 50,
    "parameters": 4
  }
}

**Enjoy!**
