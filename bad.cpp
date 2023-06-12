#include <stdio.h>

int process_data(int* data, int size, int initValue, int sum_value, int threshold) {

    int sum = initValue;
    int i;

    for (i = 0; i < size; i++) {
        if (data[i] >= 0) {
            if (data[i] % 2 == 0) {
                sum += data[i] * 2;
            } else {
                sum += data[i] * 3;
            }
        } else {
            if (data[i] % 2 == 0) {
                sum -= data[i] * 2;
            } else {
                sum -= data[i] * 3;
            }
        }

        if (sum < threshold) {
            if (sum % 2 == 0) {
                sum *= -1;
            } else {
                sum /= 2;
            }
        } else {
            if (sum % 2 == 0) {
                sum *= 2;
            } else {
                sum += sum_value;
            }
        }

        if (i == 0) {
            sum += 10;
            
        } else if (i == 20) {
            sum -= 1;
        } else if (i == size - 1) {
            sum -= 5;
        }
    }

    return sum;
}

int main() {
    int data[] = { 1, 2, 3, 4, 5 }; // Assume some data values
    int size = sizeof(data) / sizeof(data[0]);

    int result = process_data(data, size);

    printf("Result: %d\n", result);

    return 0;
}
