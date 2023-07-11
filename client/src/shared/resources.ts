
interface SubmitResponse {
  msg: string;
}
export const submit = async () => {
  const asd: SubmitResponse = await (await fetch(`http://localhost:8080/ping`)).json();
  console.log("asd", asd);
  return asd;
}