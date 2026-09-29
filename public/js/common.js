const isSeller = () => {
  console.log("is Seller");
  if(document.querySelector(".sellerradio")) {
    if(document.querySelector(".sellerradio").checked) {
      document.querySelector(".sellerradio").value="seller";
    }
    else {
      document.querySelector(".sellerradio").value="buyer";
    }
  }
}