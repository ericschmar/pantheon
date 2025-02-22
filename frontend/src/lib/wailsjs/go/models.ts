export namespace enums {
	
	export enum EventType {
	    CONNECTED = "connected",
	    DISCONNECTED = "disconnected",
	}

}

export namespace services {
	
	export class LdapConn {
	    key: string;
	    host: string;
	    port: string;
	    username: string;
	    password: string;
	    name: string;
	    base_dn: string;
	    is_favorited: boolean;
	
	    static createFrom(source: any = {}) {
	        return new LdapConn(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.username = source["username"];
	        this.password = source["password"];
	        this.name = source["name"];
	        this.base_dn = source["base_dn"];
	        this.is_favorited = source["is_favorited"];
	    }
	}

}

export namespace tree {
	
	export class LDAPEntry {
	    dn: string;
	    attrs: Record<string, string[]>;
	
	    static createFrom(source: any = {}) {
	        return new LDAPEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dn = source["dn"];
	        this.attrs = source["attrs"];
	    }
	}
	export class TreeNode {
	    id: string;
	    entry?: LDAPEntry;
	    children: TreeNode[];
	
	    static createFrom(source: any = {}) {
	        return new TreeNode(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.entry = this.convertValues(source["entry"], LDAPEntry);
	        this.children = this.convertValues(source["children"], TreeNode);
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
	export class Tree {
	    Root?: TreeNode;
	
	    static createFrom(source: any = {}) {
	        return new Tree(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Root = this.convertValues(source["Root"], TreeNode);
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

