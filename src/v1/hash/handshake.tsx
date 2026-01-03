// This file is part of the Wealthx project.
// Copyright © 2023 WealthX. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ec as EC } from 'elliptic';
import CryptoJS from 'crypto-js';

const ec = new EC('p256'); // Match Dart's elliptic usage — or use 'secp256k1' to match original

class Handshake {
    static bytesToHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }

    static hexToBytes(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        }
        return bytes;
    }

    static generate(): { privateKey: string; publicKey: string } {
        const keyPair = ec.genKeyPair();
        return {
            privateKey: keyPair.getPrivate('hex'),
            publicKey: keyPair.getPublic(false, 'hex') // false = uncompressed format: 04 + X + Y
        };
    }

    static generateFromPrivate(privateKeyHex: string): { privateKey: string; publicKey: string } {
        const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
        return {
            privateKey: privateKeyHex,
            publicKey: keyPair.getPublic(false, 'hex')
        };
    }

    static secret(privateKeyHex: string, otherPublicKeyHex: string): string {
        const myKey = ec.keyFromPrivate(privateKeyHex, 'hex');
        const otherPub = ec.keyFromPublic(otherPublicKeyHex, 'hex');
        const shared = myKey.derive(otherPub.getPublic()); // BigInt
        return shared.toString(16).padStart(64, '0'); // Hex-encoded shared secret
    }

    static encrypt(message: string, sharedSecret: string): string {
        // Hash the shared secret to get 32-byte key (synchronous with CryptoJS)
        const keyHash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(sharedSecret));
        const key = CryptoJS.lib.WordArray.create(keyHash.words.slice(0, 8)); // 32 bytes = 8 words

        // Generate random IV using browser crypto (synchronous)
        const ivArray = new Uint8Array(16);
        window.crypto.getRandomValues(ivArray);
        const iv = CryptoJS.lib.WordArray.create(Array.from(ivArray) as any);

        // Apply manual PKCS7 padding
        const messageBytes = new TextEncoder().encode(message);
        const blockSize = 16;
        const padLength = blockSize - (messageBytes.length % blockSize);
        const paddedMessage = new Uint8Array(messageBytes.length + padLength);
        paddedMessage.set(messageBytes);
        for (let i = messageBytes.length; i < paddedMessage.length; i++) {
            paddedMessage[i] = padLength;
        }

        // Convert to CryptoJS WordArray
        const messageWordArray = CryptoJS.lib.WordArray.create(Array.from(paddedMessage) as any);

        // Encrypt with AES-256-CBC
        const encrypted = CryptoJS.AES.encrypt(messageWordArray, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.NoPadding // We already manually padded
        });

        // Return IV:Ciphertext in hex format
        return this.bytesToHex(ivArray) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    }

    static decrypt(cipherTextWithIV: string, sharedSecret: string): string {
        const [ivHex, encryptedHex] = cipherTextWithIV.split(':');

        // Hash the shared secret to get 32-byte key
        const keyHash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(sharedSecret));
        const key = CryptoJS.lib.WordArray.create(keyHash.words.slice(0, 8)); // 32 bytes

        // Parse IV and ciphertext
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const ciphertext = CryptoJS.enc.Hex.parse(encryptedHex);

        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext } as any,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.NoPadding // Manual padding removal
            }
        );

        // Convert to Uint8Array for manual padding removal
        const decryptedBytes = new Uint8Array(
            decrypted.words.flatMap(word => [
                (word >>> 24) & 0xff,
                (word >>> 16) & 0xff,
                (word >>> 8) & 0xff,
                word & 0xff
            ])
        );

        // Strip PKCS7 padding manually
        const padLength = decryptedBytes[decryptedBytes.length - 1];
        const unpadded = decryptedBytes.slice(0, decryptedBytes.length - padLength);

        // Convert to string
        return new TextDecoder().decode(unpadded);
    }

}

export default Handshake;