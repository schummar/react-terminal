import React, { useEffect, useState } from 'react';
import { Paragraph, Text, createRoot } from './src';

function Element() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((count) => count + 1);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Paragraph>
      Count: {count}
      <Text shrink ellipsis>
        --------------------------------------------------------------------------------------------------------
      </Text>
      #
    </Paragraph>
  );
}

const { render, writeLine } = createRoot();
render(
  <Paragraph margin={[1, 0, 0, 0]} prefix="|">
    <Element />
    <Element />
    <Element />
    <Element />
  </Paragraph>,
);

writeLine('', { backgroundColor: 'white', grow: true });
// let i = 0;
// setInterval(() => {
//   console.log(`additional ${i++}`);
//   writeLine(`line ${i++}`, { prefix: '> ' });
//   writeLine(`line ${i++}`, { prefix: '> ', backgroundColor: 'red', color: 'blue', grow: 1 });
// }, 500);
