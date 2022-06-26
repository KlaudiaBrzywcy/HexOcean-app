import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { v4 as uuidv4 } from "uuid";
import "./FormWrapper.css";
import FormField from "./FormField/FormField";
import FormFieldSelect from "./FormField/FormFieldSelect";
import { FaPizzaSlice, FaBreadSlice } from "react-icons/fa";
import { CgBowl } from "react-icons/cg";

const FormWrapper = () => {
  const [stateID, setStateID] = useState(uuidv4());
  const [errSubmit, setErrSubmit] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      preparation_time: "",
      type: "",
      no_of_slices: 0,
      diameter: 0,
      spicyness_scale: 0,
      slices_of_bread: 0,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(50, "Max 50 characters")
        .required("Name is required!"),

      preparation_time: Yup.string()
        .required("Preparation time is required!")
        .matches(/^\d{2}:\d{2}:\d{2}$/gm, "Set required format!"),

      type: Yup.string().required("Type is required!"),
      no_of_slices: Yup.number().when("type", {
        is: "pizza",
        then: Yup.number()
          .required("Nr of slices is required!")
          .min(1, "Min 1 slice!"),
      }),

      diameter: Yup.number().when("type", {
        is: "pizza",
        then: Yup.number()
          .min(15, "Min 15 cm!")
          .required("Nr of slices is required!"),
      }),

      spicyness_scale: Yup.number().when("type", {
        is: "soup",
        then: Yup.number()
          .min(1, "Spiciness scale 1-10!")
          .max(10, "Spiciness scale 1-10!")
          .required("Spiciness scale is required!"),
      }),

      slices_of_bread: Yup.number().when("type", {
        is: "sandwich",
        then: Yup.number()
          .min(1, "Min 1 slice!")
          .required("Nr of slices is required!"),
      }),
    }),
    onSubmit: (values, { resetForm }) => {
      let foodieID = { id: stateID };
      const foodieForm = { ...values, ...foodieID };
      console.log("ff", foodieForm);
      const readyFoodieForm = Object.entries(foodieForm).filter(
        ([, value]) => value !== 0
      );
      console.log(Object.fromEntries(readyFoodieForm));
      fetch("https://frosty-wood-6558.getsandbox.com:443/dishe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(readyFoodieForm)),
      })
        .then(() =>
          console.log(JSON.stringify(Object.fromEntries(readyFoodieForm)))
        )
        .then(() => resetForm())
        .then(() => setStateID(uuidv4()))
        .then(() => setErrSubmit(""))
        .catch((error) => {
          console.log("Submission failed");
          setErrSubmit("Submission failed!");
        });
    },
  });

  return (
    <div className="form-wrapper">
      <form onSubmit={formik.handleSubmit} id="form">
        <FormField
          label={"Name:"}
          type={"text"}
          name={"name"}
          placeholder={"dish name"}
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.name && formik.errors.name ? (
          <p className="err">{formik.errors.name}</p>
        ) : null}
        <FormField
          label={"Preparation time:"}
          type={"text"}
          name={"preparation_time"}
          placeholder={"00:00:00"}
          value={formik.values.preparation_time}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.preparation_time && formik.errors.preparation_time ? (
          <p className="err">{formik.errors.preparation_time}</p>
        ) : null}

        <FormFieldSelect
          label={"Type:"}
          name={"type"}
          value={formik.values.type}
          onChange={(e) => {
            formik.handleChange(e);
            if (e.currentTarget.value === "pizza") {
              formik.values.slices_of_bread = 0;
              formik.values.spicyness_scale = 0;
            } else if (e.currentTarget.value === "sandwich") {
              formik.values.no_of_slices = 0;
              formik.values.diameter = 0;
              formik.values.spicyness_scale = 0;
            } else if (e.currentTarget.value === "soup") {
              formik.values.no_of_slices = 0;
              formik.values.diameter = 0;
              formik.values.slices_of_bread = 0;
            }
          }}
          onBlur={formik.handleBlur}
        />
        {formik.touched.type && formik.errors.type ? (
          <p className="err">{formik.errors.type}</p>
        ) : null}

        {formik.values.type === "pizza" && (
          <>
            <span className="icon">
              <FaPizzaSlice />
            </span>
            <FormField
              label={"Number of slices:"}
              type={"number"}
              name={"no_of_slices"}
              placeholder={"Nr of slices?"}
              value={formik.values.no_of_slices}
              onChange={formik.handleChange}
              min={1}
            />
            {formik.errors.no_of_slices ? (
              <p className="err">{formik.errors.no_of_slices}</p>
            ) : null}

            <FormField
              label={"Diameter:"}
              type={"number"}
              name={"diameter"}
              placeholder={"Diameter of your pizza in cm?"}
              value={parseFloat(formik.values.diameter)}
              onChange={formik.handleChange}
              step={0.1}
              min={15}
            />
            {formik.errors.diameter ? (
              <p className="err">{formik.errors.diameter}</p>
            ) : null}
          </>
        )}

        {formik.values.type === "soup" && (
          <>
            <span className="icon">
              <CgBowl />
            </span>
            <FormField
              label={"Spiciness scale:"}
              type={"number"}
              name={"spicyness_scale"}
              placeholder={"Spicyness on scale 1-10"}
              value={formik.values.spicyness_scale}
              onChange={formik.handleChange}
              min={0}
              max={10}
            />
            {formik.errors.spicyness_scale ? (
              <p className="err">{formik.errors.spicyness_scale}</p>
            ) : null}
          </>
        )}

        {formik.values.type === "sandwich" && (
          <>
            <span className="icon">
              <FaBreadSlice />
            </span>
            <FormField
              label={"Slices of bread:"}
              type={"number"}
              name={"slices_of_bread"}
              placeholder={"How many slices?"}
              value={formik.values.slices_of_bread}
              onChange={formik.handleChange}
              min={0}
            />
            {formik.errors.slices_of_bread ? (
              <p className="err">{formik.errors.slices_of_bread}</p>
            ) : null}
          </>
        )}

        <button type="submit" className="submit-btn">
          SUBMIT
        </button>
      </form>
      <p className="err-submit">{errSubmit}</p>
    </div>
  );
};

export default FormWrapper;
