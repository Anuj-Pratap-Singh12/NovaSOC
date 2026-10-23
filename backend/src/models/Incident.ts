import mongoose, { Schema, Types } from "mongoose";

const IncidentSchema = new Schema(
  {
    // Reference to the Log document
    log: { type: Types.ObjectId, ref: "Log" },

    // Snapshot of rule that triggered the incident
    rule: {
      id: Number,
      name: String,
      field: String,
      op: String,
      value: Schema.Types.Mixed,
      severity: String,
      attack: String,
    },

    // Incident metadata
    severity: { type: String, required: true },
    attack: { type: String, required: true },

    target: { type: String, default: "Web Server" },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Blocked"],
      default: "Open",
    },

    analyst: { type: String, default: "" },

    // ⭐ VPN SCORE (0–100)
    vpn_score: { type: Number, default: 0 },

    // ⭐ VPN PROVIDER NAME (if detected)
    vpn_provider: { type: String, default: null },

    // ⭐ Whether IP is currently blocked by firewall
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent model overwrite during hot reload
export default mongoose.models.Incident ||
  mongoose.model("Incident", IncidentSchema);
