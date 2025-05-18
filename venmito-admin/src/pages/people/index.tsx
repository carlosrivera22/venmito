import { usePeople } from "@/hooks/usePeople";
import { Container } from "@mui/material";

export default function People() {
    const { people } = usePeople();
    console.log("People: ", people);
    return <Container>People</Container>;
}