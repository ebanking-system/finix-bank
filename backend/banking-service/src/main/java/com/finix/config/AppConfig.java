package com.finix.config;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
	/*
	 * configure ModelMapper as spring bean
	 * <bean id class ...../>
	 * Add @Bean annotated method to return ModelMapper instance
	 * - to be managed by SC
	 */
	@Bean //method level annotation - to declare a method returning java object
	 ModelMapper modelMapper()
	{
		ModelMapper mapper=new ModelMapper();
		//configure mapper - to transfer the matching props (name + data type)
		mapper.getConfiguration()
		.setMatchingStrategy(MatchingStrategies.STRICT)
		//configure mapper - not to transfer nulls from src -> dest
		.setPropertyCondition(Conditions.isNotNull());
		return mapper;//Method rets configured ModelMapper bean to SC
	}
	
}
