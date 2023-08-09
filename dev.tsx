import React, { useEffect, useState } from 'react';
import { Paragraph, createRoot } from './src';

function Element() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((count) => count + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return <Paragraph>Count: {count}</Paragraph>;
}

const { render, writeLine } = createRoot();
render(
  <Paragraph margin={1} prefix="|">
    <Element />
    <Element />
    <Element />
    <Element />
  </Paragraph>,
);

let i = 0;
setInterval(() => {
  console.log(`additional ${i++}`);
  writeLine(`line ${i++}`, { prefix: '> ' });
  writeLine(`line ${i++}`, { prefix: '> ', backgroundColor: 'red' });
}, 100);
