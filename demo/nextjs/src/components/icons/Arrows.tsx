import { HiArrowRight } from "react-icons/hi";

import MuiIconWrapper, { type IconProps } from "./_MuiIconWrapper";

export const RightArrowIcon = (props: IconProps) => {
  return <MuiIconWrapper {...props} Icon={HiArrowRight} />;
};
