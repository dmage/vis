class Queue<T> {
    data: Array<T> = [];

    push(value: T): void {
        this.data.push(value);
    }

    pop(): T {
        return this.data.shift();
    }

    unpop(value: T): void {
        this.data.unshift(value);
    }

    size(): number {
        return this.data.length;
    }
}
