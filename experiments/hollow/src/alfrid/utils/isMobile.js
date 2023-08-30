const mobileCheck = () => {
  let isMobile = false;
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    isMobile = true;
  }

  return isMobile;
};

const isMobile = mobileCheck();

export { isMobile };
