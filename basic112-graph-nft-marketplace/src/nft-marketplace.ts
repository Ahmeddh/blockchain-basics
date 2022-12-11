import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ItemBought as ItemBoughtEvent,
  ItemListed as ItemListedEvent,
  ListingCancelled as ListingCancelledEvent,
  ListingUpdated as ListingUpdatedEvent
} from "../generated/NftMarketplace/NftMarketplace"
import {
  ItemBought,
  ItemListed,
  ListingCancelled,
  ListingUpdated,
  ActiveItem
} from "../generated/schema"

export function handleItemBought(event: ItemBoughtEvent): void {
  let itemBought = ItemBought.load(event.transaction.hash.concatI32(event.logIndex.toI32()))
  let activeItem = ActiveItem.load(getIdFromEvevntParams(event.params.tokenId, event.params.nftAddress))

  if (!itemBought) {
    itemBought = new ItemBought(event.transaction.hash.concatI32(event.logIndex.toI32()))
  }
  itemBought.buyer = event.params.buyer
  itemBought.nftAddress = event.params.nftAddress
  itemBought.tokenId = event.params.tokenId
  itemBought.price = event.params.price
  activeItem!.buyer = event.params.buyer

  itemBought.blockNumber = event.block.number
  itemBought.blockTimestamp = event.block.timestamp
  itemBought.transactionHash = event.transaction.hash

  itemBought.save()
  activeItem!.save()
}

export function handleItemListed(event: ItemListedEvent): void {
  let activeItem = ActiveItem.load(getIdFromEvevntParams(event.params.tokenId, event.params.nftAddress))
  let itemListed = ItemListed.load(event.transaction.hash.concatI32(event.logIndex.toI32()))

  if (!itemListed) {
    itemListed = new ItemListed(event.transaction.hash.concatI32(event.logIndex.toI32()))
  }
  if (!activeItem) {
    activeItem = new ActiveItem(getIdFromEvevntParams(event.params.tokenId, event.params.nftAddress))
  }

  itemListed.seller = event.params.seller
  itemListed.nftAddress = event.params.nftAddress
  itemListed.tokenId = event.params.tokenId
  itemListed.price = event.params.price

  activeItem.seller = event.params.seller
  activeItem.nftAddress = event.params.nftAddress
  activeItem.tokenId = event.params.tokenId
  activeItem.price = event.params.price
  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000")

  itemListed.blockNumber = event.block.number
  itemListed.blockTimestamp = event.block.timestamp
  itemListed.transactionHash = event.transaction.hash

  activeItem.blockNumber = event.block.number
  activeItem.blockTimestamp = event.block.timestamp
  activeItem.transactionHash = event.transaction.hash

  itemListed.save()
  activeItem.save()
}

export function handleListingCancelled(event: ListingCancelledEvent): void {
  let listingCancelled = ListingCancelled.load(event.transaction.hash.concatI32(event.logIndex.toI32()))
  let activeItem = ActiveItem.load(getIdFromEvevntParams(event.params.tokenId, event.params.nftAddress))

  if (!listingCancelled) {
    listingCancelled = new ListingCancelled(event.transaction.hash.concatI32(event.logIndex.toI32()))
  }

  listingCancelled.nftAddress = event.params.nftAddress
  listingCancelled.tokenId = event.params.tokenId
  listingCancelled.spender = event.params.spender
  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD")

  listingCancelled.blockNumber = event.block.number
  listingCancelled.blockTimestamp = event.block.timestamp
  listingCancelled.transactionHash = event.transaction.hash

  listingCancelled.save()
  activeItem!.save()
}

export function handleListingUpdated(event: ListingUpdatedEvent): void {
  let listingUpdated = ListingUpdated.load(event.transaction.hash.concatI32(event.logIndex.toI32()))
  let activeItem = ActiveItem.load(getIdFromEvevntParams(event.params.tokenId, event.params.nftAddress))


  if (!listingUpdated) {
    listingUpdated = new ListingUpdated(event.transaction.hash.concatI32(event.logIndex.toI32()))
  }

  listingUpdated.nftAddress = event.params.nftAddress
  listingUpdated.tokenId = event.params.tokenId
  listingUpdated.spender = event.params.spender
  listingUpdated.oldPrice = event.params.oldPrice
  listingUpdated.updatedPrice = event.params.updatedPrice

  activeItem!.price = event.params.updatedPrice

  listingUpdated.blockNumber = event.block.number
  listingUpdated.blockTimestamp = event.block.timestamp
  listingUpdated.transactionHash = event.transaction.hash

  listingUpdated.save()
  activeItem!.save()
}

function getIdFromEvevntParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString()
}
