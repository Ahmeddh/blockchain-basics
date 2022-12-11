import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  ItemBought,
  ItemListed,
  ListingCancelled,
  ListingUpdated
} from "../generated/NftMarketplace/NftMarketplace"

export function createItemBoughtEvent(
  buyer: Address,
  nftAddress: Address,
  tokenId: BigInt,
  price: BigInt
): ItemBought {
  let itemBoughtEvent = changetype<ItemBought>(newMockEvent())

  itemBoughtEvent.parameters = new Array()

  itemBoughtEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  itemBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  itemBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  itemBoughtEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return itemBoughtEvent
}

export function createItemListedEvent(
  seller: Address,
  nftAddress: Address,
  tokenId: BigInt,
  price: BigInt
): ItemListed {
  let itemListedEvent = changetype<ItemListed>(newMockEvent())

  itemListedEvent.parameters = new Array()

  itemListedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  itemListedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return itemListedEvent
}

export function createListingCancelledEvent(
  nftAddress: Address,
  tokenId: BigInt,
  spender: Address
): ListingCancelled {
  let ListingCancelledEvent = changetype<ListingCancelled>(newMockEvent())

  ListingCancelledEvent.parameters = new Array()

  ListingCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  ListingCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  ListingCancelledEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )

  return ListingCancelledEvent
}

export function createListingUpdatedEvent(
  nftAddress: Address,
  tokenId: BigInt,
  spender: Address,
  oldPrice: BigInt,
  updatedPrice: BigInt
): ListingUpdated {
  let ListingUpdatedEvent = changetype<ListingUpdated>(newMockEvent())

  ListingUpdatedEvent.parameters = new Array()

  ListingUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "nftAddress",
      ethereum.Value.fromAddress(nftAddress)
    )
  )
  ListingUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  ListingUpdatedEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  ListingUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldPrice",
      ethereum.Value.fromUnsignedBigInt(oldPrice)
    )
  )
  ListingUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "updatedPrice",
      ethereum.Value.fromUnsignedBigInt(updatedPrice)
    )
  )

  return ListingUpdatedEvent
}
