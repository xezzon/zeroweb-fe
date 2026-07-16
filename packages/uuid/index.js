/**
 * 生成自定义的 UUIDv8
 *
 * 布局结构 (由左至右):
 * - 8 bits:  namespace (参数)
 * - 4 bits:  serial 高位片段
 * - 4 bits:  Version (固定为 8)
 * - 2 bits:  serial 片段
 * - 2 bits:  Variant (固定为 10)
 * - 102 bits: serial 剩余低位
 *
 * @param {number} namespace - 命名空间，取值范围 0 ~ 255
 * @param {bigint} serial - 序列号，无符号整数
 * @returns {string} UUID v8 字符串
 */
export function uuidv8(namespace, serial) {
  // 1. 参数校验与转换
  if (
    typeof namespace !== 'number' ||
    namespace < 0 ||
    namespace > 255 ||
    !Number.isInteger(namespace)
  ) {
    throw new TypeError('Namespace must be an integer between 0 and 255.');
  }

  // 将 serial 转换为 BigInt，确保支持大整数并保证位操作安全
  // 支持传入 Number, String 或 BigInt
  const serialBigInt = BigInt(serial);

  // 2. 初始化 16 字节缓冲区
  const buffer = new Uint8Array(16);

  // 3. 填充 Namespace (存入字节 0)
  buffer[0] = namespace;

  // 4. 填充 Serial (存入字节 1 到 15)
  // 策略：从 UUID 的末尾(字节15)向前填充，这样 serial 的 LSB(最低有效位) 位于 UUID 的末尾，
  // 确保生成的 UUID 字符串随 serial 增大而增大（字典序友好）。
  let tempSerial = serialBigInt;

  for (let i = 15; i >= 1; i--) {
    // 默认掩码：使用全部 8 位 (0xFF = 11111111)
    let mask = 0xff;
    let bitsToTake = 8;

    // 特殊处理字节 6 (索引 6):
    // UUID 格式要求高 4 位为 Version (0b1000 即 8)。
    // 因此该字节只能用低 4 位来存储数据。
    if (i === 6) {
      mask = 0x0f; // 00001111
      bitsToTake = 4;
    }
    // 特殊处理字节 7 (索引 7):
    // UUID 格式要求高 2 位为 Variant (0b10)。
    // 因此该字节只能用低 6 位来存储数据。
    else if (i === 7) {
      mask = 0x3f; // 00111111
      bitsToTake = 6;
    }

    // 从 serialBigInt 中截取当前的位片段
    // 注意：这里取的是 serial 的低位
    const chunk = tempSerial & BigInt(mask);

    // 写入 buffer
    buffer[i] = Number(chunk);

    // 将 serialBigInt 右移，丢弃已写入的位，准备下一次循环
    tempSerial = tempSerial >> BigInt(bitsToTake);
  }

  // 注意：如果 serialBigInt 超过了 114 位 (2^114)，此时 tempSerial 仍大于 0，
  // 多出的高位会被自动丢弃（截断），符合通常 ID 生成的行为。

  // 5. 强制设置版本号和变体位 (覆盖掩码部分的高位)

  // 字节 6: 设置高 4 位为 Version 8 (0b1000 -> 0x80)
  // 保留 buffer[6] 的低 4 位数据
  buffer[6] = (buffer[6] & 0x0f) | 0x80;

  // 字节 7: 设置高 2 位为 Variant RFC 4122 (0b10 -> 0x80)
  // 保留 buffer[7] 的低 6 位数据
  buffer[7] = (buffer[7] & 0x3f) | 0x80;

  // 6. 格式化为 UUID 字符串 (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  const hexBytes = Array.from(buffer).map((b) => b.toString(16).padStart(2, '0'));

  return [
    hexBytes.slice(0, 4).join(''),
    hexBytes.slice(4, 6).join(''),
    hexBytes.slice(6, 8).join(''),
    hexBytes.slice(8, 10).join(''),
    hexBytes.slice(10, 16).join(''),
  ].join('-');
}
