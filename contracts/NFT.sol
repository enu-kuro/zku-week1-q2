//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./libraries/Base64.sol";

contract NFT is ERC721URIStorage {
    uint8 public constant TOTAL_SUPPLY = 4;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32[] public _hashes = new bytes32[](TOTAL_SUPPLY * 2 - 1);

    event NewNFTMinted(address sender, uint256 tokenId);

    constructor() ERC721("ZKU_NFT", "ZFT") {
        setupMerkleTree();
        console.log("Initialized MerkleTree!");
    }

    function merkleroot() public view returns (bytes32) {
        return _hashes[_hashes.length - 1];
    }

    function setupMerkleTree() private {
        uint8 hashIndex = 0;
        for (uint8 i = 0; i < TOTAL_SUPPLY; i++) {
            _hashes[hashIndex] = keccak256(abi.encodePacked(""));
            hashIndex++;
        }

        uint8 n = TOTAL_SUPPLY;
        uint8 offset = 0;

        while (n > 0) {
            for (uint8 i = 0; i < n - 1; i += 2) {
                _hashes[hashIndex] = keccak256(
                    abi.encodePacked(
                        _hashes[offset + i],
                        _hashes[offset + i + 1]
                    )
                );
                hashIndex++;
            }
            offset += n;
            n = n / 2;
        }
    }

    function updateMerkleTree(bytes32 _hash, uint8 _idx) private {
        uint8 hashIndex = 0;
        uint8 updateIdx = _idx;
        for (uint8 i = 0; i < TOTAL_SUPPLY; i++) {
            if (i == updateIdx) {
                _hashes[hashIndex] = _hash;
            }
            hashIndex++;
        }

        uint8 n = TOTAL_SUPPLY;
        uint8 offset = 0;

        while (n > 0) {
            for (uint8 i = 0; i < n - 1; i += 2) {
                if (offset + i == updateIdx || offset + i + 1 == updateIdx) {
                    _hashes[hashIndex] = keccak256(
                        abi.encodePacked(
                            _hashes[offset + i],
                            _hashes[offset + i + 1]
                        )
                    );
                    updateIdx = hashIndex;
                }
                hashIndex++;
            }
            offset += n;
            n = n / 2;
        }
    }

    function currentTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }

    function mint(address _receiverAddress) public {
        uint8 newItemId = uint8(_tokenIds.current());
        require(TOTAL_SUPPLY > newItemId, "no more NFT...");

        // generate JSON metadata in place and base64 encode.
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        // solhint-disable-next-line quotes
                        '{"name": "ZKU_NFT ", "description": "Week1 Question 2: Minting an NFT and committing the mint data to a Merkle Tree"}'
                    )
                )
            )
        );

        string memory tokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("\n--------------------");
        console.log(tokenUri);
        console.log("--------------------\n");

        _safeMint(_receiverAddress, newItemId);
        _setTokenURI(newItemId, tokenUri);

        _tokenIds.increment();
        console.log(
            "ItemId %s has been minted to %s",
            newItemId,
            _receiverAddress
        );

        updateMerkleTree(
            keccak256(
                abi.encodePacked(
                    msg.sender,
                    _receiverAddress,
                    newItemId,
                    tokenUri
                )
            ),
            newItemId
        );

        emit NewNFTMinted(msg.sender, newItemId);
    }
}
