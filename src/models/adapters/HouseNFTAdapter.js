class HouseNFTAdapter {
  static load = (house) => {
    return {
      id: house.id,
      name: house.name,
      address: house.address,
      description: house.description,
      image: house.imageUrl,
      attributes: [
        {
          trait_type: "Purchase Price",
          value: house.purchasePrice
        },
        {
          trait_type: "Type of Residence",
          value: house.typeOfResidence
        },
        {
          trait_type: "Bed Rooms",
          value: house.bedRooms
        },
        {
          trait_type: "Bathrooms",
          value: house.bathrooms
        },
        {
          trait_type: "Square Feet",
          value: house.squareFeet
        },
        {
          trait_type: "Year Built",
          value: house.yearBuilt
        }
      ]
    }
  }
}

export default HouseNFTAdapter;