import React from 'react';
import {
  Box,
  Button,
  SimpleGrid,
  VStack,
  Text,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

const PricingPlans = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'Starter',
      price: 49.99,
      features: [
        '100 minutes/month',
        'Basic voice quality',
        'Single language pair',
        'Email support'
      ],
      priceId: 'price_starter'
    },
    {
      name: 'Freedom',
      price: 99.99,
      features: [
        'Unlimited minutes',
        'Premium voice quality',
        'Priority processing',
        'Priority support'
      ],
      priceId: 'price_freedom',
      isPopular: true
    },
    {
      name: 'Business Elite',
      price: 299.99,
      features: [
        'Multiple devices',
        'Custom terminology',
        'Dedicated support',
        'Analytics dashboard'
      ],
      priceId: 'price_business'
    }
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} py={8}>
      {plans.map((plan) => (
        <Card
          key={plan.name}
          border={plan.isPopular ? '2px' : '1px'}
          borderColor={plan.isPopular ? 'purple.500' : 'gray.200'}
          borderRadius="xl"
        >
          <CardHeader>
            {plan.isPopular && (
              <Box
                position="absolute"
                top="-4"
                right="-4"
                bg="purple.500"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                Most Popular
              </Box>
            )}
            <VStack spacing={4}>
              <Heading size="lg">{plan.name}</Heading>
              <Box fontSize="6xl" fontWeight="bold">
                ${plan.price}
                <Text as="span" fontSize="xl" fontWeight="medium" color="gray.500">
                  /month
                </Text>
              </Box>
            </VStack>
          </CardHeader>

          <CardBody>
            <List spacing={3}>
              {plan.features.map((feature) => (
                <ListItem key={feature}>
                  <ListIcon as={CheckIcon} color="green.500" />
                  {feature}
                </ListItem>
              ))}
            </List>
          </CardBody>

          <CardFooter>
            <Button
              w="full"
              colorScheme={plan.isPopular ? 'purple' : 'blue'}
              onClick={() => onSelectPlan(plan)}
            >
              Select {plan.name}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default PricingPlans;
