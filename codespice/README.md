## Extension Settings

For example:

This extension has the following settings:
* `codespice.jsonConfigurationPath`: Path to json configuration which contains rules.

Use ctrl+shift+p and type CodeSpice for command options.
* `codespice.start`: Enable code extension.
* `codespice.stop`: Stop code extension.

## Release Notes

Following features are implemented:
* Naming convention check
* File header comment missing 
* File length check
* File horizontal line length check
* Function cyclomatic complexity
* Function maximum lines
* Function maximum parameters
* Function parameters validation check
* Function must have explicit arguments
* Function recursion is not allowed
* Macros has to be enclosed with do/while
* Swtch/case must have default case.
* Variables must be initialized before use
* Variables address from stack must not be returned from a function
* Variables must no have narrowing conversions and type mismatches 

---

## JsonConfiguration example:

Make sure to provide configuration in json format:

```json
{
  "namingConventions": {
    "variable": "snake_case",
    "function": "snake_case",
    "constant": "UPPER_CASE"
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
    "macro_enclose": true,
    "params_validation": true,
    "no_args_check": true,
    "default_case_check": true,
    "recursion_check": true,
  },
  "variables": {
    "always_init": true,
    "stack_return_check": true,
    "narrow_conversion": false,
  }
}
```

**Enjoy!**
