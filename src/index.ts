import app from "../src/app.js"

const PORT: string | number = process.env.PORT || 3010;

try {
    app.listen(PORT, (): void => {
      console.log(`Connected successfully on port ${PORT}`);
    });
  } catch (error: any) {
    console.error(`Error occurred: ${error.message}`);
  }
