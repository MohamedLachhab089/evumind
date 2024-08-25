import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative w-[80%] mb-4 mx-auto">
      <input
        id={id}
        name={name}
        type={type == "password" ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        defaultValue={value}
        className="input-box rounded-lg"
      />
      <i className={"fi " + icon + " input-icon"}></i>
      {type == "password" ? (
        <i
          className={
            "fi fi-rr-eye" +
            (!showPassword ? "-crossed" : "") +
            " input-icon left-[auto] right-4 cursor-pointer"
          }
          onClick={() => {
            setShowPassword((currentVal) => !currentVal);
          }}
        ></i>
      ) : (
        ""
      )}
    </div>
  );
};

export default InputBox;
