﻿using ReliabilityModel.Model.System;

namespace ReliabilityModel.Api.Models.Requests
{
    public class SingleModuleSystemRequest : SystemRequest
    {
        public string ModuleName { get; set; }

        public double FailureRate { get; set; }

        public double RecoveryRate { get; set; }

        public int? Left { get; set; }

        public override Model.System.System ToSystem()
        {
            return new SingleModuleSystem(ModuleName, Left)
            {
                FailureRate = FailureRate,
                RecoveryRate = RecoveryRate
            };
        }
    }
}