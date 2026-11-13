
function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

// Safely construct paths, including keys containing dots or spaces.
function getChildPath(parentPath, key) {
  return `${parentPath}[${JSON.stringify(String(key))}]`;
}

function isObject(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function areEqual(a, b) {
  return Object.is(a, b);
}

export function diffJSON(oldData, newData) {
  const changes = [];

  const summary = {
    added: 0,
    removed: 0,
    modified: 0,
    unchanged: 0
  };

  function addChange(change) {
    changes.push(change);
    summary[change.type]++;
  }

  function compare(oldValue, newValue, path = "$") {
    const oldType = getType(oldValue);
    const newType = getType(newValue);

    // Different data types.
    if (oldType !== newType) {
      addChange({
        path,
        type: "modified",
        oldValue,
        newValue,
        oldType,
        newType
      });
      return;
    }

    // Primitive values.
    if (!isObject(oldValue) && !Array.isArray(oldValue)) {
      if (areEqual(oldValue, newValue)) {
        summary.unchanged++;
      } else {
        addChange({
          path,
          type: "modified",
          oldValue,
          newValue
        });
      }

      return;
    }

    // Compare arrays by index.
    if (Array.isArray(oldValue)) {
      const maxLength = Math.max(
        oldValue.length,
        newValue.length
      );

      for (let i = 0; i < maxLength; i++) {
        const oldExists = i < oldValue.length;
        const newExists = i < newValue.length;
        const childPath = `${path}[${i}]`;

        if (!oldExists) {
          addChange({
            path: childPath,
            type: "added",
            newValue: newValue[i]
          });
        } else if (!newExists) {
          addChange({
            path: childPath,
            type: "removed",
            oldValue: oldValue[i]
          });
        } else {
          compare(
            oldValue[i],
            newValue[i],
            childPath
          );
        }
      }

      return;
    }

    // Compare object properties.
    const oldKeys = Object.keys(oldValue);
    const newKeys = Object.keys(newValue);

    const allKeys = new Set([
      ...oldKeys,
      ...newKeys
    ]);

    for (const key of allKeys) {
      const oldExists = Object.hasOwn(oldValue, key);
      const newExists = Object.hasOwn(newValue, key);

      const childPath = getChildPath(path, key);

      if (!oldExists) {
        addChange({
          path: childPath,
          type: "added",
          newValue: newValue[key]
        });
      } else if (!newExists) {
        addChange({
          path: childPath,
          type: "removed",
          oldValue: oldValue[key]
        });
      } else {
        compare(
          oldValue[key],
          newValue[key],
          childPath
        );
      }
    }
  }

  compare(oldData, newData);

  return {
    count: changes.length,
    summary,
    changes
  };
}
