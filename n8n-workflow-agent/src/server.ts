import app from './app';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`n8n-workflow-agent listening on port ${port}`);
});
