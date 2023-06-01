# CodeSPICE
Inspector for code regarding ASPICE assessment

# Dependencies
* Node.js v20.2.0
* npm v9.6.6
* npm install -g yo generator-code


## TODO:

Out of bounds checking

Uninitialized variables

Division by zero

Input Validation

Array index out of bounds

Pointer arithmetic overflow

Buffer overflow

Condition that is always true/false ??

unreachable code

## CERT C

Rule: ARR30-C. Do not form or use out-of-bounds pointers or array indices.
Description: Accessing arrays or pointers beyond their bounds can lead to buffer overflows or undefined behavior. Ensure that array indices and pointers remain within the valid range.


Rule: INT32-C. Ensure that operations on signed integers do not result in overflow.
Description: Overflowing signed integers can lead to undefined behavior or unintended results. Check for potential overflow conditions cybersecurity in C languageand handle them appropriately.

Rule: MSC13-C. Detect and remove unused code.
Description: Unused code may contain security vulnerabilities or become a maintenance burden. Regularly detect and remove unused code to improve security and code maintainability.

Rule: DCL30-C. Do not reuse a variable in its declarator or within its declarator scope.
Description: Reusing a variable in its declarator or within its declarator scope can lead to unintended consequences and make the code harder to understand and maintain.

Rule: MSC24-C. Do not access a volatile object through a non-volatile reference.
Description: Accessing a volatile object through a non-volatile reference can lead to undefined behavior or unexpected results. Ensure that volatile objects are accessed correctly.


# Preproessor
PRE32-C. Do not use preprocessor directives in invocations of function-like macros
https://wiki.sei.cmu.edu/confluence/display/c/PRE32-C.+Do+not+use+preprocessor+directives+in+invocations+of+function-like+macros

PRE00-C. Prefer inline or static functions to function-like macros
https://wiki.sei.cmu.edu/confluence/display/c/PRE00-C.+Prefer+inline+or+static+functions+to+function-like+macros

PRE10-C. Wrap multistatement macros in a do-while loop
https://wiki.sei.cmu.edu/confluence/display/c/PRE10-C.+Wrap+multistatement+macros+in+a+do-while+loop

# Declarations and Initialization (DCL)
DCL01-C. Do not reuse variable names in subscopes
https://wiki.sei.cmu.edu/confluence/display/c/DCL01-C.+Do+not+reuse+variable+names+in+subscopes

DCL04-C. Do not declare more than one variable per declaration
https://wiki.sei.cmu.edu/confluence/display/c/DCL04-C.+Do+not+declare+more+than+one+variable+per+declaration

DCL19-C. Minimize the scope of variables and functions
https://wiki.sei.cmu.edu/confluence/display/c/DCL19-C.+Minimize+the+scope+of+variables+and+functions


DCL20-C. Explicitly specify void when a function accepts no arguments - Information Outflow
https://wiki.sei.cmu.edu/confluence/display/c/DCL20-C.+Explicitly+specify+void+when+a+function+accepts+no+arguments

# Memory Management (MEM)
MEM10-C. Define and use a pointer validation function
https://wiki.sei.cmu.edu/confluence/display/c/MEM10-C.+Define+and+use+a+pointer+validation+function


