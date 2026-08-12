"use client"

import { signup } from "@/lib/services/auth.service";
import { InputComponent } from "./input-component";

const initialState = {
  name: "",
  email: "",
  password: "",
};

export function SignupForm() {
  return (
    <form
      action={async (formData) => {
        await signup(formData);
      }}
    >
      <InputComponent
        label="Name"
        name="name"
        placeholder="Name"
      ></InputComponent>
      <InputComponent
        label="Email"
        name="email"
        placeholder="Email"
        type="email"
      ></InputComponent>
      <InputComponent
        label="Password"
        name="password"
        placeholder="Password"
        type="password"
      ></InputComponent>
      <button type="submit">Sign Up</button>
    </form>
  );
}
