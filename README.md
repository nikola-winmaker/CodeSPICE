# CodeSPICE
Inspector for code regarding ASPICE assessment

# Dependencies
* Node.js v20.2.0
* npm v9.6.6
* npm install -g yo generator-code


## TODO:

Ussage of ninitialized variables

Function Input Validation beefore ussage

unreachable code

## CERT C

Rule: DCL30-C. Do not reuse a variable in its declarator or within its declarator scope.
Description: Reusing a variable in its declarator or within its declarator scope can lead to unintended consequences and make the code harder to understand and maintain.

Rule: MSC24-C. Do not access a volatile object through a non-volatile reference.
Description: Accessing a volatile object through a non-volatile reference can lead to undefined behavior or unexpected results. Ensure that volatile objects are accessed correctly.

# Preproessor
PRE32-C. Do not use preprocessor directives in invocations of function-like macros
https://wiki.sei.cmu.edu/confluence/display/c/PRE32-C.+Do+not+use+preprocessor+directives+in+invocations+of+function-like+macros

PRE10-C. Wrap multistatement macros in a do-while loop
https://wiki.sei.cmu.edu/confluence/display/c/PRE10-C.+Wrap+multistatement+macros+in+a+do-while+loop

# Declarations and Initialization (DCL)
DCL01-C. Do not reuse variable names in subscopes
https://wiki.sei.cmu.edu/confluence/display/c/DCL01-C.+Do+not+reuse+variable+names+in+subscopes

DCL04-C. Do not declare more than one variable per declaration
https://wiki.sei.cmu.edu/confluence/display/c/DCL04-C.+Do+not+declare+more+than+one+variable+per+declaration

DCL20-C. Explicitly specify void when a function accepts no arguments - Information Outflow
https://wiki.sei.cmu.edu/confluence/display/c/DCL20-C.+Explicitly+specify+void+when+a+function+accepts+no+arguments



