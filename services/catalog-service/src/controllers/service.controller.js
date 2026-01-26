import axios from "axios";
import Service from "../models/Service.js";
import mongoose from "mongoose";

const PRESTATAIRE_SERVICE_URL = process.env.PRESTATAIRE_SERVICE_URL;

export const createService = async (req, res) => {
  try {
    const { name, category, description, price, icon } = req.body;

    const service = await Service.create({
      name,
      category,
      description,
      price,
      icon,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getServices = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const services = await Service.find(filter).populate(
      "category",
      "name icon"
    );

    res.json(services);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "category",
      "name icon"
    );

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// 🔥 NEW AGGREGATION ENDPOINT
export const getServiceWithPrestataires = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "category",
      "name icon"
    );

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    const prestatairesRes = await axios.get(
      `${PRESTATAIRE_SERVICE_URL}/prestataires/by-service/${service._id}`
    );

    res.json({
      service,
      prestataires: prestatairesRes.data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
};
