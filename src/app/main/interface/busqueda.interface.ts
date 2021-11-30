// To parse this data:
//
//   import { Convert, BusquedaResponse } from "./file";
//
//   const busquedaResponse = Convert.toBusquedaResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface BusquedaResponse {
    content:          data[];
    number:           number;
    size:             number;
    totalElements:    number;
    pageable:         Pageable;
    last:             boolean;
    totalPages:       number;
    sort:             Sort;
    first:            boolean;
    numberOfElements: number;
    empty:            boolean;
}

export interface data {
    id:                     number;
    typeLicense:            TypeLicense;
    days:                   number;
    initDate:               Date;
    medicDiagnostic:        MedicDiagnostic;
    acceptanceStatement:    boolean;
    assignationType:        string;
    medicCenter:            null;
    approvedDays:           number;
    codeOfEmployed:         null;
    endingDate:             Date;
    medicalCertificateDate: Date;
    birthDate:              null;
    neonatology:            boolean;
    neonatologyDays:        null;
    multipleBirth:          boolean;
    numberOfchildren:       null;
    probableBirthDate:      null;
    fitToWork:              boolean;
    jobSector:              JobSector;
    gcbaLicenseStatus:      string;
    organizationalUnits:    OrganizationalUnit[];
    licenseTypesGroup:      LicenseTypesGroup;
    medicalDecisions:       any[];
    user:                   User;
    appointmentDate:        null;
    observations:           null | string;
}

export interface JobSector {
    id:          number;
    created:     Date;
    updated:     Date;
    code:        string;
    description: string;
}

export interface LicenseTypesGroup {
    id:          number;
    description: string;
}

export interface MedicDiagnostic {
    id:           string;
    key:          string;
    description:  string;
    category:     string;
    ter:          number;
    autoDecision: string;
}

export interface OrganizationalUnit {
    id:            number;
    created:       Date;
    updated:       Date;
    codeOU:        string;
    descriptionOU: string;
    jobPositions:  JobPosition[];
}

export interface JobPosition {
    id:                     number;
    created:                Date;
    updated:                Date;
    jobPositionCode:        string;
    jobPositionDescription: string;
    jobPositionNumericCode: number;
}

export interface TypeLicense {
    id:           number;
    key:          string;
    description:  string;
    type:         string;
    relationship: null;
}

export interface User {
    id:         number;
    businessId: string;
    tenant:     string;
    name:       string;
    surname:    string;
    cuil:       string;
}

export interface Pageable {
    sort:       Sort;
    offset:     number;
    pageNumber: number;
    pageSize:   number;
    paged:      boolean;
    unpaged:    boolean;
}

export interface Sort {
    sorted:   boolean;
    unsorted: boolean;
    empty:    boolean;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toBusquedaResponse(json: string): BusquedaResponse {
        return cast(JSON.parse(json), r("BusquedaResponse"));
    }

    public static busquedaResponseToJson(value: BusquedaResponse): string {
        return JSON.stringify(uncast(value, r("BusquedaResponse")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "BusquedaResponse": o([
        { json: "content", js: "content", typ: a(r("Content")) },
        { json: "number", js: "number", typ: 0 },
        { json: "size", js: "size", typ: 0 },
        { json: "totalElements", js: "totalElements", typ: 0 },
        { json: "pageable", js: "pageable", typ: r("Pageable") },
        { json: "last", js: "last", typ: true },
        { json: "totalPages", js: "totalPages", typ: 0 },
        { json: "sort", js: "sort", typ: r("Sort") },
        { json: "first", js: "first", typ: true },
        { json: "numberOfElements", js: "numberOfElements", typ: 0 },
        { json: "empty", js: "empty", typ: true },
    ], false),
    "Content": o([
        { json: "id", js: "id", typ: 0 },
        { json: "typeLicense", js: "typeLicense", typ: r("TypeLicense") },
        { json: "days", js: "days", typ: 0 },
        { json: "initDate", js: "initDate", typ: Date },
        { json: "medicDiagnostic", js: "medicDiagnostic", typ: r("MedicDiagnostic") },
        { json: "acceptanceStatement", js: "acceptanceStatement", typ: true },
        { json: "assignationType", js: "assignationType", typ: "" },
        { json: "medicCenter", js: "medicCenter", typ: null },
        { json: "approvedDays", js: "approvedDays", typ: 0 },
        { json: "codeOfEmployed", js: "codeOfEmployed", typ: null },
        { json: "endingDate", js: "endingDate", typ: Date },
        { json: "medicalCertificateDate", js: "medicalCertificateDate", typ: Date },
        { json: "birthDate", js: "birthDate", typ: null },
        { json: "neonatology", js: "neonatology", typ: true },
        { json: "neonatologyDays", js: "neonatologyDays", typ: null },
        { json: "multipleBirth", js: "multipleBirth", typ: true },
        { json: "numberOfchildren", js: "numberOfchildren", typ: null },
        { json: "probableBirthDate", js: "probableBirthDate", typ: null },
        { json: "fitToWork", js: "fitToWork", typ: true },
        { json: "jobSector", js: "jobSector", typ: r("JobSector") },
        { json: "gcbaLicenseStatus", js: "gcbaLicenseStatus", typ: "" },
        { json: "organizationalUnits", js: "organizationalUnits", typ: a(r("OrganizationalUnit")) },
        { json: "licenseTypesGroup", js: "licenseTypesGroup", typ: r("LicenseTypesGroup") },
        { json: "medicalDecisions", js: "medicalDecisions", typ: a("any") },
        { json: "user", js: "user", typ: r("User") },
        { json: "appointmentDate", js: "appointmentDate", typ: null },
        { json: "observations", js: "observations", typ: u(null, "") },
    ], false),
    "JobSector": o([
        { json: "id", js: "id", typ: 0 },
        { json: "created", js: "created", typ: Date },
        { json: "updated", js: "updated", typ: Date },
        { json: "code", js: "code", typ: "" },
        { json: "description", js: "description", typ: "" },
    ], false),
    "LicenseTypesGroup": o([
        { json: "id", js: "id", typ: 0 },
        { json: "description", js: "description", typ: "" },
    ], false),
    "MedicDiagnostic": o([
        { json: "id", js: "id", typ: "" },
        { json: "key", js: "key", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "category", js: "category", typ: "" },
        { json: "ter", js: "ter", typ: 0 },
        { json: "autoDecision", js: "autoDecision", typ: "" },
    ], false),
    "OrganizationalUnit": o([
        { json: "id", js: "id", typ: 0 },
        { json: "created", js: "created", typ: Date },
        { json: "updated", js: "updated", typ: Date },
        { json: "codeOU", js: "codeOU", typ: "" },
        { json: "descriptionOU", js: "descriptionOU", typ: "" },
        { json: "jobPositions", js: "jobPositions", typ: a(r("JobPosition")) },
    ], false),
    "JobPosition": o([
        { json: "id", js: "id", typ: 0 },
        { json: "created", js: "created", typ: Date },
        { json: "updated", js: "updated", typ: Date },
        { json: "jobPositionCode", js: "jobPositionCode", typ: "" },
        { json: "jobPositionDescription", js: "jobPositionDescription", typ: "" },
        { json: "jobPositionNumericCode", js: "jobPositionNumericCode", typ: 0 },
    ], false),
    "TypeLicense": o([
        { json: "id", js: "id", typ: 0 },
        { json: "key", js: "key", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "relationship", js: "relationship", typ: null },
    ], false),
    "User": o([
        { json: "id", js: "id", typ: 0 },
        { json: "businessId", js: "businessId", typ: "" },
        { json: "tenant", js: "tenant", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "surname", js: "surname", typ: "" },
        { json: "cuil", js: "cuil", typ: "" },
    ], false),
    "Pageable": o([
        { json: "sort", js: "sort", typ: r("Sort") },
        { json: "offset", js: "offset", typ: 0 },
        { json: "pageNumber", js: "pageNumber", typ: 0 },
        { json: "pageSize", js: "pageSize", typ: 0 },
        { json: "paged", js: "paged", typ: true },
        { json: "unpaged", js: "unpaged", typ: true },
    ], false),
    "Sort": o([
        { json: "sorted", js: "sorted", typ: true },
        { json: "unsorted", js: "unsorted", typ: true },
        { json: "empty", js: "empty", typ: true },
    ], false),
};
