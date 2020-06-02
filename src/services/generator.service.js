export function Generator({ depth, segmentLength }) {
  const normalizeIndex = (index) => {
    return index < 10 ? `${'0'.repeat(segmentLength - 1)}${index}` : index;
  };

  const insertIndexAt = ({ start = '', end, index }) => {
    return `${start.slice(0, depth)}${normalizeIndex(index)}${'0'.repeat(
      end.slice(depth + segmentLength).length
    )}`;
  };

  const modifyId = (id, position, modifyCallback) => {
    const modifiedId = modifyCallback(
      +id.slice(position, position + segmentLength)
    );

    return `${id.slice(0, position)}${normalizeIndex(modifiedId)}${id.slice(
      position + segmentLength
    )}`;
  };

  return {
    normalizeIndex,
    insertIndexAt,
    modifyId
  };
}
