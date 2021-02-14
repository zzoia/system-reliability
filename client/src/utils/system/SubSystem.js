import { GrandChildConnection } from "./GrandChildConnection";

export class SubSystem {

    constructor() {
        this.parents = [];
        this.children = [];
    }

    equalsTo(anotherSubSystem) {
        throw Error("Abstract method invoked.");
    }

    getRepresentation() {
        throw Error("Abstract method invoked.");
    }

    hasOneChildWithOneParent() {
        return this.children.length === 1 && this.children[0].parents.length === 1;
    }

    clearParentChildRelations() {
        this.parents = [];
        this.children = [];
    }

    removeChild(oldChild) {
        this.children = this.children.filter(child => !child.equalsTo(oldChild));
    }

    removeParent(oldParent) {
        this.parents = this.parents.filter(parent => !parent.equalsTo(oldParent));
    }

    replaceSelfFromParents(newChild) {

        this.parents.forEach(parent => {
            parent.replaceChild(this, newChild);
        })
    }

    hasOneChildWithOneParent() {
        return this.children.length === 1 && this.children[0].parents.length === 1;
    }

    replaceChild(currentChild, newChild) {

        // Delete old reference to "currentChild" from parents...
        this.children = this.children.filter(sibling => !sibling.equalsTo(currentChild));

        // ...add (replace it with) "newChild"...
        this.children.push(newChild);

        // ...create backward link from the new "newChild"
        newChild.parents.push(this);
    }

    replaceParent(currentParent, newParent) {

        // Child moves to children collection of a new parent
        newParent.children.push(this);

        // Old parent is removed from the collection
        this.parents = this.parents.filter(par => !par.equalsTo(currentParent));

        // New parent is added to the collection
        this.parents.push(newParent);
    }

    moveChildrenTo(newParent) {

        this.children.forEach(child => {
            child.replaceParent(this, newParent);
        });
    }

    groupGrandChildren() {
        let commonGrandChildren = [];

        const findData = grandChild => commonGrandChildren.find(
            common => common.is(grandChild)
        );

        this.children.forEach(child => {

            // this child will no be considered to be merged into "or"
            if (child.children.length !== 1) return;

            const grandChild = child.children[0];
            const connection = findData(grandChild);

            if (connection) {
                connection.addConnection(child);
            } else {
                commonGrandChildren.push(new GrandChildConnection(grandChild, child));
            }

        });

        return commonGrandChildren.filter(
            common => common.hasMoreThenOneConnection()
        );
    }

}
