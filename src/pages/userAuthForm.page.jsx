import { Link } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import { useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { storeInSession } from "../common/session";

// pour effectuer des requêtes HTTP
// permet de communiquer avec des API en envoyant des requêtes GET, POST, PUT, DELETE, etc.
import axios from "axios";

const UserAuthForm = ({ type }) => {
  // useRef de React pour créer une référence mutable qui peut être attachée à un élément DOM dans votre composant.
  const authForm = useRef();

  // const userAuthThroughServer = (serverRoute, formData) => {
  //   axios
  //     .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
  //     .then(({ data }) => {
  //       console.log(data);
  //       toast.success("Success dazt");
  //     })
  //     .catch(({ response }) => {
  //       toast.error(response.data.error);
  //       toast.error(errorMessage);
  //     });
  // };

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        console.log(sessionStorage);
        toast.success("Success!"); // Success message on successful login
      })
      .catch(({ response }) => {
        // Display error messages based on server response
        const errorMessage = response.data.error || "Please try again";
        toast.error(errorMessage);
      });
  };

  const handSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    // formData
    const form = new FormData(authForm.current);
    const formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;

    // Form validation
    if (fullname && fullname.length < 3) {
      return toast.error("Fullname must be at least 3 characters long");
    }
    if (!email.length) {
      return toast.error("Enter Email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!password.length) {
      return toast.error("Enter Password");
    }
    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password must be between 6 and 20 characters long and contain at least one uppercase, one lowercase, and one number"
      );
    }

    userAuthThroughServer(serverRoute, formData);
  };
  return (
    <AnimationWrapper key={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form ref={authForm} className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-thin text-center mb-24 mt-8">
            {type == "sign-in" ? "Welcome back" : "Join us today"}
          </h1>
          {type !== "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />
          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handSubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative flex w-full items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
            <img src={googleIcon} className="w-5" />
            continue with google
          </button>

          {type == "sign-in" ? (
            <p className="text-center mt-6 text-dark-grey text-xl">
              Don't have an account yet ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us
              </Link>
            </p>
          ) : (
            <p className="text-center mt-6 text-dark-grey text-xl">
              Already a member ?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
