import { Signer, TypedDataDomain } from "ethers";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";

const EBOOL_T = 0;
const EUINT4_T = 1;
const EUINT8_T = 2;
const EUINT16_T = 3;
const EUINT32_T = 4;
const EUINT64_T = 5;
const EUINT128_T = 6;
const EUINT160_T = 7; // @dev It is the one for eaddresses.
const EUINT256_T = 8;
const EBYTES64_T = 9;
const EBYTES128_T = 10;
const EBYTES256_T = 11;

export function verifyType(handle: bigint, expectedType: number) {
  if (handle === BigInt(0)) {
    throw "Handle is not initialized";
  }

  if (handle.toString(2).length > 256) {
    throw "Handle is not a bytes32";
  }

  const typeCt = handle >> BigInt(8);

  if (Number(typeCt % BigInt(256)) !== expectedType) {
    throw "Wrong encrypted type for the handle";
  }
}

export async function reencryptEuint64(
  signer: Signer,
  instance: FhevmInstance,
  handle: bigint,
  contractAddress: string,
): Promise<bigint> {
  verifyType(handle, EUINT64_T);
  
  console.log("🔍 reencryptEuint64 - Starting...");
  console.log("🔍 reencryptEuint64 - handle:", handle.toString());
  console.log("🔍 reencryptEuint64 - contractAddress:", contractAddress);

  return reencryptHandle(signer, instance, handle, contractAddress);
}
/**
 * @dev This function is to reencrypt handles.
 *      It does not verify types.
 */
async function reencryptHandle(
  signer: Signer,
  instance: FhevmInstance,
  handle: bigint,
  contractAddress: string,
): Promise<bigint> {
  console.log("🔍 reencryptHandle - Starting...");
  console.log("🔍 reencryptHandle - instance:", instance);
  console.log("🔍 reencryptHandle - instance.generateKeypair:", typeof instance.generateKeypair);
  
  try {
    const { publicKey, privateKey } = instance.generateKeypair();
    
    // Debug logs
    console.log("🔍 reencryptHandle - publicKey:", publicKey);
    console.log("🔍 reencryptHandle - publicKey type:", typeof publicKey);
    console.log("🔍 reencryptHandle - publicKey is array:", Array.isArray(publicKey));
    
    console.log("🔍 reencryptHandle - instance.createEIP712:", typeof instance.createEIP712);
    
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "365"; // Cambiar de "10" a "365"
    const eip712 = instance.createEIP712(publicKey, [contractAddress], startTimeStamp, durationDays);
    console.log("🔍 eip712 completo:", JSON.stringify(eip712, null, 2));
    console.log("🔍 eip712.types:", eip712.types);
    console.log("🔍 eip712.types.Reencrypt:", eip712.types?.Reencrypt);
    
    // Arreglar para Ethers v6 - usar la API correcta
    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },

      eip712.message,
    );

    console.log("🔍 Métodos disponibles en instance:", Object.getOwnPropertyNames(instance));
    console.log("🔍 instance.userDecrypt:", typeof instance.userDecrypt);
    console.log("🔍 instance.publicDecrypt:", typeof instance.publicDecrypt);

    const reencryptedHandle = await instance.userDecrypt(
      [{ handle: "0x" + handle.toString(16).padStart(64, '0'), contractAddress }],
      privateKey,
      publicKey,
      signature.replace("0x", ""),
      [contractAddress],
      await signer.getAddress(),
      startTimeStamp,  // usar el mismo valor
      durationDays,    // usar "365" en lugar de "1"
    );

    console.log("🔍 reencryptedHandle:", reencryptedHandle);
    console.log("🔍 reencryptedHandle type:", typeof reencryptedHandle);
    console.log("🔍 reencryptedHandle keys:", Object.keys(reencryptedHandle));

    // Extraer el primer valor del objeto
    const firstKey = Object.keys(reencryptedHandle)[0];
    const decryptedValue = reencryptedHandle[firstKey];

    return BigInt(decryptedValue as string); // Asegurar que es un bigint
  } catch (error) {
    console.error("❌ reencryptHandle - Error in keypair generation or EIP712 creation:", error);
    throw error;
  }
}

