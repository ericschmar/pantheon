export namespace tree {
	
	export class Node[map[string]interface {}] {
	    name: string;
	    nodes?: Node[map[string]interface {}][];
	    payload: {[key: string]: any};
	
	    static createFrom(source: any = {}) {
	        return new Node[map[string]interface {}](source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.nodes = this.convertValues(source["nodes"], Node[map[string]interface {}]);
	        this.payload = source["payload"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Tree[map[string]interface {}] {
	    Root?: Node[map[string]interface {}];
	    Refs: {[key: string]: Node[map[string]interface {}]};
	
	    static createFrom(source: any = {}) {
	        return new Tree[map[string]interface {}](source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Root = this.convertValues(source["Root"], Node[map[string]interface {}]);
	        this.Refs = source["Refs"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

