import _ from 'lodash';

const listItem = (key, value) => ({
    prev: null,
    next: null,
    key,
    value 
});

export class LinkedList {

    head = null;
    tail = null;
    hash = { };
    length = 0;
    // order = [ ];

    constructor(items = []) {

        let prev = null;

        for(const [ key, value ] of items) {

            if(!!this.hash[key]) {
                throw new Error(`Duplicate item found with key "${key}" - keys must be unique`);
            }

            const item = listItem(key, value);

            item.prev = prev;

            prev = item;

            this.head ??= item;
            this.hash[key] = item;

        }

        this.length = items.length;

        this.tail = prev;

    }

    push(key, value) {

        if(this.has(key)) {
            throw new Error(`An item already exists with the key "${key}" - cannot re-add item.`);
        }

        const item = listItem(key, value);

        if(this.tail !== null) {
            this.tail.next = item;
            item.prev = this.tail;
        }

        this.tail = item;
        this.head ??= item;

        this.hash[key] = item;
        
        ++this.length;

        return item;

    }

    pop() {

        if(!this.tail) {
            return null;
        }

        const item = this.tail;
        delete this.hash[item.key];
        --this.length;

        const prev = item.prev;

        if(prev) {
            prev.next = null;
        } else {
            this.head = null;
        }

        return item;

    }

    get(key) {
        return this.hash[key];
    }

    set(key, value) {
        if(this.has(key)) {
            this.hash[key].value = value;
        }
    }

    has(key) {
        return !!this.hash[key];
    }

    remove(key) {
        if(!this.has(key) || this.length === 0) {
            return;
        }

        const item = this.hash[key];

        if(item === this.tail) {
            this.tail = item.prev;
        } else {
            item.next.prev = item.prev;
        }

        if(item === this.head) {
            this.head = item.next;
        } else {
            item.prev.next = item.next;
        }

        delete this.hash[key];

        --this.length;

        return item;

    }

    reduce(callback, initialValue) {

        let item = this.head;
        let value = _.cloneDeep(initialValue);

        let index = 0;

        while(item) {
            value = callback(value, item.value, item.key, index);
            ++index;
            item = item.next;
        }

        return value;

    }

    insertBefore(cursorNode, newItem) {
        newItem.prev = cursorNode.prev;

        if(cursorNode === this.head) {
            this.head = newItem;
        } else {
            cursorNode.prev.next = newItem;
        }

        newItem.next = cursorNode;
        cursorNode.prev = newItem;

        this.hash[ newItem.key ] = newItem;
        ++this.length;

        return newItem;
    }

    static CreateListItem(key, value) {
        return {
            prev: null,
            next: null,
            key,
            value
        }
    }

    // get tail() {
    //     return this.length === 0 ? null : this.order[this.order.length - 1];
    // }

    // get head() {
    //     return this.length === 0 ? null : this.order[0];
    // }

    // get length() {
    //     return this.order.length;
    // }


}