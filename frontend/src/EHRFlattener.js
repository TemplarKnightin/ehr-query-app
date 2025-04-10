import models from "../models/models.json";

export default class EHRFlattener {
  constructor(model = models) {
    this.model = model;
  }

  extractValueFromPath(path, obj) {
    try {
      const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
      return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    } catch {
      return undefined;
    }
  }

  flattenObject(ehr, model = this.model, flat = {}) {
    const process = (node) => {
      if (node.path) {
        const val = this.extractValueFromPath(node.path, ehr);
        flat[node.name] = val?.value ?? val?.magnitude ?? val ?? "N/A";
      }
      if (node.children) {
        node.children.forEach(process);
      }
    };
    process(model);
    return flat;
  }

  flattenEHRS(ehrs) {
    return ehrs.map((ehr) => this.flattenObject(ehr));
  }
}
